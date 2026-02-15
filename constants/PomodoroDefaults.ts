import { PomodoroSettings } from '../types/pomodoro.types';

export const DEFAULT_SETTINGS: PomodoroSettings = {
  workDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  sessionsBeforeLongBreak: 4,
  autoStartBreaks: false,
  autoStartWork: false,
  soundEnabled: true,
  vibrationEnabled: true,
  tickingSound: false,
  keepScreenAwake: true,
  timerColor: '#5BB8B0',
  breakColor: '#9B8EC4',
  backgroundPreset: 'lavender',
};

// Rainbow order, matte palette
export const COLOR_OPTIONS = [
  { label: 'Cherry', value: '#C75B6A' },
  { label: 'Rose', value: '#D4849A' },
  { label: 'Coral', value: '#E08B6D' },
  { label: 'Peach', value: '#E8A87C' },
  { label: 'Amber', value: '#D4A054' },
  { label: 'Sage', value: '#7DB88F' },
  { label: 'Mint', value: '#5EC4A8' },
  { label: 'Cyan', value: '#5BB8B0' },
  { label: 'Sky', value: '#6CB4E8' },
  { label: 'Ocean', value: '#4A90D9' },
  { label: 'Lavender', value: '#9B8EC4' },
  { label: 'Plum', value: '#B07CC6' },
];

export const BACKGROUND_PRESETS = [
  {
    label: 'Lavender Mist',
    value: 'lavender',
    gradient: ['#e8dff5', '#c9e4f6', '#f0e6f6', '#d4eef9'],
    orbs: ['#b8a9e8', '#a8e6e2', '#e0b8d8'],
  },
  {
    label: 'Sunset Glow',
    value: 'sunset',
    gradient: ['#f5e6df', '#f6d4c9', '#f6e6f0', '#f9e4d4'],
    orbs: ['#e8b8a9', '#f0c8a8', '#e0b8c8'],
  },
  {
    label: 'Ocean Breeze',
    value: 'ocean',
    gradient: ['#dff0f5', '#c9e4f6', '#dff5f0', '#c9f0f6'],
    orbs: ['#a9d8e8', '#a8e6d2', '#b8d8e0'],
  },
  {
    label: 'Mint Garden',
    value: 'mint',
    gradient: ['#e0f5e8', '#d4f0e6', '#e8f5e0', '#d4f6e8'],
    orbs: ['#a8e8c0', '#b8e6d0', '#a0d8b8'],
  },
  {
    label: 'Rose Quartz',
    value: 'rose',
    gradient: ['#f5dfe8', '#f0d4e0', '#f6e0e8', '#f4d8e4'],
    orbs: ['#e8a9c0', '#e0b8c8', '#d8a8b8'],
  },
  {
    label: 'Slate',
    value: 'slate',
    gradient: ['#e4e6ea', '#dde0e6', '#e8eaee', '#e0e2e8'],
    orbs: ['#b8bcc8', '#c0c4d0', '#aeb2be'],
  },
];

export const TIME_ADJUSTMENT_MIN = -15;
export const TIME_ADJUSTMENT_MAX = 15;
export const TIME_ADJUSTMENT_STEP = 1;

export const STORAGE_KEYS = {
  POMODORO_SETTINGS: '@study_buddy_pomodoro_settings',
};
