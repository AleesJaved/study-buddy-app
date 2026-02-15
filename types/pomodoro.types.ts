export type SessionType = 'work' | 'shortBreak' | 'longBreak';

export type TimerStatus = 'idle' | 'running' | 'paused';

export interface PomodoroSettings {
  workDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  sessionsBeforeLongBreak: number;
  autoStartBreaks: boolean;
  autoStartWork: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  tickingSound: boolean;
  keepScreenAwake: boolean;
  timerColor: string;
  breakColor: string;
  backgroundPreset: string;
}

export interface PomodoroState {
  timeRemaining: number;
  totalTime: number;
  status: TimerStatus;
  sessionType: SessionType;
  currentSession: number;
  completedSessions: number;
  breakSessions: Set<number>;
}

export interface PomodoroActions {
  play: () => void;
  pause: () => void;
  restart: () => void;
  skip: () => void;
  adjustTime: (minutes: number) => void;
  updateSettings: (settings: Partial<PomodoroSettings>) => void;
}
