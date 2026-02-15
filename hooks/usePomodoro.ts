import { useState, useEffect, useRef, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import {
  PomodoroSettings,
  PomodoroState,
  PomodoroActions,
  SessionType,
  TimerStatus,
} from '../types/pomodoro.types';
import { DEFAULT_SETTINGS, STORAGE_KEYS } from '../constants/PomodoroDefaults';
import { fetchRemoteSettings, saveRemoteSettings, fetchRemoteTimerState, saveRemoteTimerState, TimerState } from '../utils/settingsSync';

function getDurationForSession(sessionType: SessionType, settings: PomodoroSettings): number {
  switch (sessionType) {
    case 'work':
      return settings.workDuration * 60;
    case 'shortBreak':
      return settings.shortBreakDuration * 60;
    case 'longBreak':
      return settings.longBreakDuration * 60;
  }
}

function getNextSessionType(
  currentType: SessionType,
  completedSessions: number,
  settings: PomodoroSettings
): SessionType {
  if (currentType === 'work') {
    if ((completedSessions + 1) % settings.sessionsBeforeLongBreak === 0) {
      return 'longBreak';
    }
    return 'shortBreak';
  }
  return 'work';
}

export function usePomodoro(userId?: string | null): PomodoroState & PomodoroActions & { settings: PomodoroSettings } {
  const [settings, setSettings] = useState<PomodoroSettings>(DEFAULT_SETTINGS);
  const [sessionType, setSessionType] = useState<SessionType>('work');
  const [status, setStatus] = useState<TimerStatus>('idle');
  const [currentSession, setCurrentSession] = useState(1);
  const [completedSessions, setCompletedSessions] = useState(0);
  const [breakSessions, setBreakSessions] = useState<Set<number>>(new Set());

  const initialTime = getDurationForSession(sessionType, settings);
  const [timeRemaining, setTimeRemaining] = useState(initialTime);
  const [totalTime, setTotalTime] = useState(initialTime);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const handleSessionCompleteRef = useRef<() => void>(() => {});
  const syncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timerSyncRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load settings and timer state: prefer remote (Supabase) if authenticated, else local
  useEffect(() => {
    (async () => {
      try {
        // Always load local first for instant display
        const stored = await AsyncStorage.getItem(STORAGE_KEYS.POMODORO_SETTINGS);
        if (stored) {
          const parsed = JSON.parse(stored) as Partial<PomodoroSettings>;
          setSettings((prev) => ({ ...prev, ...parsed }));
        }

        // Load local timer state
        const storedTimer = await AsyncStorage.getItem(STORAGE_KEYS.POMODORO_SETTINGS + '_timer');
        if (storedTimer) {
          const ts = JSON.parse(storedTimer) as TimerState;
          setSessionType(ts.sessionType);
          setTimeRemaining(ts.timeRemaining);
          setTotalTime(ts.totalTime);
          setStatus(ts.status === 'running' ? 'paused' : ts.status);
          setCurrentSession(ts.currentSession);
          setCompletedSessions(ts.completedSessions);
        }

        // If authenticated, fetch remote and merge (remote wins)
        if (userId) {
          const remote = await fetchRemoteSettings(userId);
          if (remote) {
            setSettings(remote);
            await AsyncStorage.setItem(
              STORAGE_KEYS.POMODORO_SETTINGS,
              JSON.stringify(remote)
            );
          }

          const remoteTimer = await fetchRemoteTimerState(userId);
          if (remoteTimer) {
            setSessionType(remoteTimer.sessionType);
            setTimeRemaining(remoteTimer.timeRemaining);
            setTotalTime(remoteTimer.totalTime);
            setStatus(remoteTimer.status === 'running' ? 'paused' : remoteTimer.status);
            setCurrentSession(remoteTimer.currentSession);
            setCompletedSessions(remoteTimer.completedSessions);
          }
        }
      } catch {}
    })();
  }, [userId]);

  // Recalculate time when settings change and timer is idle
  useEffect(() => {
    if (status === 'idle') {
      const newTime = getDurationForSession(sessionType, settings);
      setTimeRemaining(newTime);
      setTotalTime(newTime);
    }
  }, [settings, sessionType, status]);

  const handleSessionComplete = useCallback(() => {
    if (settings.vibrationEnabled) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    const nextType = getNextSessionType(sessionType, completedSessions, settings);
    const newCompletedSessions =
      sessionType === 'work' ? completedSessions + 1 : completedSessions;

    setCompletedSessions(newCompletedSessions);
    setSessionType(nextType);

    // Track which session index is now on a break
    if (nextType !== 'work') {
      setBreakSessions((prev) => new Set(prev).add(newCompletedSessions - 1));
    }

    const newTime = getDurationForSession(nextType, settings);
    setTimeRemaining(newTime);
    setTotalTime(newTime);

    if (nextType !== 'work') {
      setCurrentSession((prev) => prev);
      if (settings.autoStartBreaks) {
        setStatus('running');
      } else {
        setStatus('idle');
      }
    } else {
      // If coming back from a long break, reset the full cycle
      if (sessionType === 'longBreak') {
        setCompletedSessions(0);
        setCurrentSession(1);
        setBreakSessions(new Set());
      } else {
        setCurrentSession((prev) => prev + 1);
      }
      if (settings.autoStartWork) {
        setStatus('running');
      } else {
        setStatus('idle');
      }
    }
  }, [sessionType, completedSessions, settings]);

  // Keep ref up to date so interval always calls latest version
  useEffect(() => {
    handleSessionCompleteRef.current = handleSessionComplete;
  }, [handleSessionComplete]);

  // Timer interval
  useEffect(() => {
    if (status === 'running') {
      intervalRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!);
            handleSessionCompleteRef.current();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [status]);

  // Persist timer state locally + remote (debounced)
  const persistTimerState = useCallback(
    (state: TimerState) => {
      AsyncStorage.setItem(
        STORAGE_KEYS.POMODORO_SETTINGS + '_timer',
        JSON.stringify(state)
      ).catch(() => {});

      if (userId) {
        if (timerSyncRef.current) clearTimeout(timerSyncRef.current);
        timerSyncRef.current = setTimeout(() => {
          saveRemoteTimerState(userId, state);
        }, 500);
      }
    },
    [userId]
  );

  const play = useCallback(() => {
    if (settings.vibrationEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setStatus('running');
  }, [settings.vibrationEnabled]);

  const pause = useCallback(() => {
    if (settings.vibrationEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setStatus((prev) => {
      // Save state when pausing
      persistTimerState({
        sessionType,
        timeRemaining,
        totalTime,
        status: 'paused',
        currentSession,
        completedSessions,
      });
      return 'paused';
    });
  }, [settings.vibrationEnabled, sessionType, timeRemaining, totalTime, currentSession, completedSessions, persistTimerState]);

  const restart = useCallback(() => {
    if (settings.vibrationEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setSessionType('work');
    const newTime = getDurationForSession('work', settings);
    setTimeRemaining(newTime);
    setTotalTime(newTime);
    setStatus('idle');
    setCompletedSessions(0);
    setCurrentSession(1);
    setBreakSessions(new Set());
    persistTimerState({
      sessionType: 'work',
      timeRemaining: newTime,
      totalTime: newTime,
      status: 'idle',
      currentSession: 1,
      completedSessions: 0,
    });
  }, [settings, persistTimerState]);

  const skip = useCallback(() => {
    if (settings.vibrationEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    handleSessionComplete();
  }, [handleSessionComplete, settings.vibrationEnabled]);

  const adjustTime = useCallback(
    (minutes: number) => {
      const adjustment = minutes * 60;
      setTimeRemaining((prev) => {
        const newTime = Math.max(0, prev + adjustment);
        return newTime;
      });
      setTotalTime((prev) => {
        const newTotal = Math.max(60, prev + adjustment);
        return newTotal;
      });
    },
    []
  );

  // Save timer state when session completes (after state updates settle)
  useEffect(() => {
    if (status === 'idle' || status === 'paused') {
      persistTimerState({
        sessionType,
        timeRemaining,
        totalTime,
        status,
        currentSession,
        completedSessions,
      });
    }
  }, [sessionType, currentSession, completedSessions]);

  const updateSettings = useCallback(
    async (newSettings: Partial<PomodoroSettings>) => {
      const updated = { ...settings, ...newSettings };
      setSettings(updated);
      try {
        await AsyncStorage.setItem(
          STORAGE_KEYS.POMODORO_SETTINGS,
          JSON.stringify(updated)
        );
      } catch {}

      // Debounced sync to Supabase (500ms after last change)
      if (userId) {
        if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
        syncTimeoutRef.current = setTimeout(() => {
          saveRemoteSettings(userId, updated);
        }, 500);
      }
    },
    [settings, userId]
  );

  return {
    timeRemaining,
    totalTime,
    status,
    sessionType,
    currentSession,
    completedSessions,
    breakSessions,
    settings,
    play,
    pause,
    restart,
    skip,
    adjustTime,
    updateSettings,
  };
}
