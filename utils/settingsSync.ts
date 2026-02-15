import { supabase } from './supabase';
import { PomodoroSettings, SessionType, TimerStatus } from '../types/pomodoro.types';

export interface TimerState {
  sessionType: SessionType;
  timeRemaining: number;
  totalTime: number;
  status: TimerStatus;
  currentSession: number;
  completedSessions: number;
}

// Convert PomodoroSettings (camelCase) to DB columns (snake_case)
function toDbRow(settings: PomodoroSettings, userId: string) {
  return {
    user_id: userId,
    work_duration: settings.workDuration,
    short_break_duration: settings.shortBreakDuration,
    long_break_duration: settings.longBreakDuration,
    sessions_before_long_break: settings.sessionsBeforeLongBreak,
    auto_start_breaks: settings.autoStartBreaks,
    auto_start_work: settings.autoStartWork,
    sound_enabled: settings.soundEnabled,
    vibration_enabled: settings.vibrationEnabled,
    ticking_sound: settings.tickingSound,
    keep_screen_awake: settings.keepScreenAwake,
    timer_color: settings.timerColor,
    break_color: settings.breakColor,
    background_preset: settings.backgroundPreset,
  };
}

// Convert DB row (snake_case) to PomodoroSettings (camelCase)
function fromDbRow(row: any): PomodoroSettings {
  return {
    workDuration: row.work_duration,
    shortBreakDuration: row.short_break_duration,
    longBreakDuration: row.long_break_duration,
    sessionsBeforeLongBreak: row.sessions_before_long_break,
    autoStartBreaks: row.auto_start_breaks,
    autoStartWork: row.auto_start_work,
    soundEnabled: row.sound_enabled,
    vibrationEnabled: row.vibration_enabled,
    tickingSound: row.ticking_sound,
    keepScreenAwake: row.keep_screen_awake,
    timerColor: row.timer_color,
    breakColor: row.break_color,
    backgroundPreset: row.background_preset,
  };
}

// Fetch settings from Supabase for the current user
export async function fetchRemoteSettings(userId: string): Promise<PomodoroSettings | null> {
  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error || !data) return null;
  return fromDbRow(data);
}

// Upsert settings to Supabase
export async function saveRemoteSettings(
  userId: string,
  settings: PomodoroSettings
): Promise<boolean> {
  const row = toDbRow(settings, userId);

  const { error } = await supabase
    .from('user_settings')
    .upsert(row, { onConflict: 'user_id' });

  if (error) {
    console.error('Failed to save remote settings:', error.message);
    return false;
  }
  return true;
}

// --- Timer State Sync ---

function timerStateToDbRow(state: TimerState, userId: string) {
  return {
    user_id: userId,
    session_type: state.sessionType,
    time_remaining: state.timeRemaining,
    total_time: state.totalTime,
    status: state.status === 'running' ? 'paused' : state.status,
    current_session: state.currentSession,
    completed_sessions: state.completedSessions,
  };
}

function timerStateFromDbRow(row: any): TimerState {
  return {
    sessionType: row.session_type as SessionType,
    timeRemaining: row.time_remaining,
    totalTime: row.total_time,
    status: row.status as TimerStatus,
    currentSession: row.current_session,
    completedSessions: row.completed_sessions,
  };
}

export async function fetchRemoteTimerState(userId: string): Promise<TimerState | null> {
  const { data, error } = await supabase
    .from('user_timer_state')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error || !data) return null;
  return timerStateFromDbRow(data);
}

export async function saveRemoteTimerState(
  userId: string,
  state: TimerState
): Promise<boolean> {
  const row = timerStateToDbRow(state, userId);

  const { error } = await supabase
    .from('user_timer_state')
    .upsert(row, { onConflict: 'user_id' });

  if (error) {
    console.error('Failed to save remote timer state:', error.message);
    return false;
  }
  return true;
}
