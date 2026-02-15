import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useColorScheme } from '../../hooks/useColorScheme';
import Colors from '../../constants/Colors';
import { PomodoroSettings } from '../../types/pomodoro.types';
import { DEFAULT_SETTINGS, STORAGE_KEYS, TIMER_COLOR_OPTIONS } from '../../constants/PomodoroDefaults';

interface NumberPickerProps {
  value: number;
  min: number;
  max: number;
  step: number;
  suffix: string;
  onValueChange: (value: number) => void;
  accentColor: string;
  textColor: string;
  backgroundColor: string;
}

function NumberPicker({
  value,
  min,
  max,
  step,
  suffix,
  onValueChange,
  accentColor,
  textColor,
  backgroundColor,
}: NumberPickerProps) {
  const decrement = () => {
    const newVal = Math.max(min, value - step);
    onValueChange(newVal);
  };

  const increment = () => {
    const newVal = Math.min(max, value + step);
    onValueChange(newVal);
  };

  return (
    <View style={styles.numberPicker}>
      <TouchableOpacity
        style={[styles.pickerButton, { backgroundColor }]}
        onPress={decrement}
        disabled={value <= min}
      >
        <Ionicons
          name="remove"
          size={18}
          color={value <= min ? backgroundColor : textColor}
        />
      </TouchableOpacity>
      <Text style={[styles.pickerValue, { color: accentColor }]}>
        {value} {suffix}
      </Text>
      <TouchableOpacity
        style={[styles.pickerButton, { backgroundColor }]}
        onPress={increment}
        disabled={value >= max}
      >
        <Ionicons
          name="add"
          size={18}
          color={value >= max ? backgroundColor : textColor}
        />
      </TouchableOpacity>
    </View>
  );
}

export default function PomodoroSettingsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const router = useRouter();
  const [settings, setSettings] = useState<PomodoroSettings>(DEFAULT_SETTINGS);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEYS.POMODORO_SETTINGS);
        if (stored) {
          setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(stored) });
        }
      } catch {}
    })();
  }, []);

  const updateSetting = <K extends keyof PomodoroSettings>(
    key: K,
    value: PomodoroSettings[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const saveSettings = async () => {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.POMODORO_SETTINGS,
        JSON.stringify(settings)
      );
      setHasChanges(false);
      router.back();
    } catch {}
  };

  const resetDefaults = async () => {
    setSettings(DEFAULT_SETTINGS);
    setHasChanges(true);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Timer Durations */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.tint }]}>
            Timer Durations
          </Text>
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, { color: colors.text }]}>
                  Focus Duration
                </Text>
                <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                  Length of each work session
                </Text>
              </View>
              <NumberPicker
                value={settings.workDuration}
                min={1}
                max={120}
                step={5}
                suffix="min"
                onValueChange={(v) => updateSetting('workDuration', v)}
                accentColor={colors.tint}
                textColor={colors.text}
                backgroundColor={colors.surfaceSecondary}
              />
            </View>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, { color: colors.text }]}>
                  Short Break
                </Text>
                <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                  Break between sessions
                </Text>
              </View>
              <NumberPicker
                value={settings.shortBreakDuration}
                min={1}
                max={30}
                step={1}
                suffix="min"
                onValueChange={(v) => updateSetting('shortBreakDuration', v)}
                accentColor={colors.pomodoroShortBreak}
                textColor={colors.text}
                backgroundColor={colors.surfaceSecondary}
              />
            </View>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, { color: colors.text }]}>
                  Long Break
                </Text>
                <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                  Extended rest period
                </Text>
              </View>
              <NumberPicker
                value={settings.longBreakDuration}
                min={1}
                max={60}
                step={5}
                suffix="min"
                onValueChange={(v) => updateSetting('longBreakDuration', v)}
                accentColor={colors.pomodoroLongBreak}
                textColor={colors.text}
                backgroundColor={colors.surfaceSecondary}
              />
            </View>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, { color: colors.text }]}>
                  Sessions Before Long Break
                </Text>
                <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                  Work sessions before extended rest
                </Text>
              </View>
              <NumberPicker
                value={settings.sessionsBeforeLongBreak}
                min={1}
                max={10}
                step={1}
                suffix=""
                onValueChange={(v) => updateSetting('sessionsBeforeLongBreak', v)}
                accentColor={colors.tint}
                textColor={colors.text}
                backgroundColor={colors.surfaceSecondary}
              />
            </View>
          </View>
        </View>

        {/* Timer Color */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.tint }]}>
            Timer Color
          </Text>
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.colorGrid}>
              {TIMER_COLOR_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={styles.colorOption}
                  onPress={() => updateSetting('timerColor', option.value)}
                >
                  <View
                    style={[
                      styles.colorSwatch,
                      { backgroundColor: option.value },
                      settings.timerColor === option.value && styles.colorSwatchSelected,
                    ]}
                  >
                    {settings.timerColor === option.value && (
                      <Ionicons name="checkmark" size={18} color="#ffffff" />
                    )}
                  </View>
                  <Text style={[styles.colorLabel, { color: colors.textSecondary }]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Behavior */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.tint }]}>
            Behavior
          </Text>
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, { color: colors.text }]}>
                  Auto-start Breaks
                </Text>
                <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                  Automatically start break timer
                </Text>
              </View>
              <Switch
                value={settings.autoStartBreaks}
                onValueChange={(v) => updateSetting('autoStartBreaks', v)}
                trackColor={{ false: colors.progressTrack, true: colors.tint + '80' }}
                thumbColor={settings.autoStartBreaks ? colors.tint : colors.textSecondary}
              />
            </View>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, { color: colors.text }]}>
                  Auto-start Work
                </Text>
                <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                  Automatically start next work session
                </Text>
              </View>
              <Switch
                value={settings.autoStartWork}
                onValueChange={(v) => updateSetting('autoStartWork', v)}
                trackColor={{ false: colors.progressTrack, true: colors.tint + '80' }}
                thumbColor={settings.autoStartWork ? colors.tint : colors.textSecondary}
              />
            </View>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, { color: colors.text }]}>
                  Keep Screen Awake
                </Text>
                <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                  Prevent screen from sleeping during timer
                </Text>
              </View>
              <Switch
                value={settings.keepScreenAwake}
                onValueChange={(v) => updateSetting('keepScreenAwake', v)}
                trackColor={{ false: colors.progressTrack, true: colors.tint + '80' }}
                thumbColor={settings.keepScreenAwake ? colors.tint : colors.textSecondary}
              />
            </View>
          </View>
        </View>

        {/* Notifications */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.tint }]}>
            Notifications
          </Text>
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, { color: colors.text }]}>
                  Sound
                </Text>
                <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                  Play sound when timer ends
                </Text>
              </View>
              <Switch
                value={settings.soundEnabled}
                onValueChange={(v) => updateSetting('soundEnabled', v)}
                trackColor={{ false: colors.progressTrack, true: colors.tint + '80' }}
                thumbColor={settings.soundEnabled ? colors.tint : colors.textSecondary}
              />
            </View>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, { color: colors.text }]}>
                  Vibration
                </Text>
                <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                  Vibrate when timer ends
                </Text>
              </View>
              <Switch
                value={settings.vibrationEnabled}
                onValueChange={(v) => updateSetting('vibrationEnabled', v)}
                trackColor={{ false: colors.progressTrack, true: colors.tint + '80' }}
                thumbColor={settings.vibrationEnabled ? colors.tint : colors.textSecondary}
              />
            </View>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, { color: colors.text }]}>
                  Ticking Sound
                </Text>
                <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                  Play ticking during focus time
                </Text>
              </View>
              <Switch
                value={settings.tickingSound}
                onValueChange={(v) => updateSetting('tickingSound', v)}
                trackColor={{ false: colors.progressTrack, true: colors.tint + '80' }}
                thumbColor={settings.tickingSound ? colors.tint : colors.textSecondary}
              />
            </View>
          </View>
        </View>

        {/* Reset */}
        <TouchableOpacity
          style={[styles.resetButton, { borderColor: colors.error }]}
          onPress={resetDefaults}
        >
          <Ionicons name="refresh" size={18} color={colors.error} />
          <Text style={[styles.resetText, { color: colors.error }]}>
            Reset to Defaults
          </Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Save Button */}
      {hasChanges && (
        <View style={[styles.saveContainer, { backgroundColor: colors.background }]}>
          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: colors.tint }]}
            onPress={saveSettings}
          >
            <Text style={styles.saveText}>Save Changes</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 10,
    marginLeft: 4,
  },
  card: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 60,
  },
  settingInfo: {
    flex: 1,
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  settingDescription: {
    fontSize: 13,
    marginTop: 2,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 16,
  },
  numberPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  pickerButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerValue: {
    fontSize: 16,
    fontWeight: '700',
    minWidth: 52,
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  resetText: {
    fontSize: 15,
    fontWeight: '600',
  },
  saveContainer: {
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 36 : 20,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  saveButton: {
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  saveText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '700',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 16,
    justifyContent: 'center',
  },
  colorOption: {
    alignItems: 'center',
    gap: 6,
    width: 64,
  },
  colorSwatch: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorSwatchSelected: {
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.8)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  colorLabel: {
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
  },
});
