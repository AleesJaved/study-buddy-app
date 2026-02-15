import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Dimensions,
  Switch,
  Platform,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
// react-native-reanimated used by child components
import { usePomodoro } from '../../hooks/usePomodoro';
import ProgressCircle from '../../components/pomodoro/ProgressCircle';
import TimerDisplay from '../../components/pomodoro/TimerDisplay';
import TimerControls from '../../components/pomodoro/TimerControls';
import TimeAdjustmentSlider from '../../components/pomodoro/TimeAdjustmentSlider';
import SessionDots from '../../components/pomodoro/SessionDots';
import GradientBackground from '../../components/ui/GradientBackground';
import GlassCard from '../../components/ui/GlassCard';
import ColorSpectrum from '../../components/ui/ColorSpectrum';
import { SessionType } from '../../types/pomodoro.types';
import { COLOR_OPTIONS, BACKGROUND_PRESETS } from '../../constants/PomodoroDefaults';
import { useAuthContext } from '../../contexts/AuthContext';

const SCREEN_HEIGHT = Dimensions.get('window').height;

function getSessionLabel(sessionType: SessionType) {
  switch (sessionType) {
    case 'work':
      return 'Focus Session';
    case 'shortBreak':
      return 'Short Break';
    case 'longBreak':
      return 'Long Break';
  }
}

export default function PomodoroScreen() {
  const scrollRef = useRef<ScrollView>(null);
  const settingsScrollRef = useRef<ScrollView>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showCustomTimer, setShowCustomTimer] = useState(false);
  const [showCustomBreak, setShowCustomBreak] = useState(false);

  const { user, isAuthenticated, signInWithGoogle, signInWithApple, signOut } = useAuthContext();

  const {
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
  } = usePomodoro(user?.id);

  const progress = totalTime > 0 ? timeRemaining / totalTime : 0;
  const timerColor = settings.timerColor || '#5BB8B0';
  const breakColor = settings.breakColor || '#9B8EC4';
  const isOnBreak = sessionType !== 'work';
  const activeColor = isOnBreak ? breakColor : timerColor;

  const bgPreset = BACKGROUND_PRESETS.find(p => p.value === settings.backgroundPreset) || BACKGROUND_PRESETS[0];
  const pageHeight = SCREEN_HEIGHT - (Platform.OS === 'ios' ? 140 : 80);

  const toggleSettings = useCallback(() => {
    const goingToSettings = !showSettings;
    setShowSettings(goingToSettings);
    if (!goingToSettings) {
      settingsScrollRef.current?.scrollTo({ y: 0, animated: false });
    }
    scrollRef.current?.scrollTo({ y: goingToSettings ? pageHeight : 0, animated: true });
  }, [showSettings, pageHeight]);

  return (
    <View style={styles.container}>
      <GradientBackground
        gradientColors={bgPreset?.gradient}
        orbColors={bgPreset?.orbs}
      />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Study Timer</Text>
          <TouchableOpacity style={styles.settingsButtonWrap} onPress={toggleSettings}>
            <GlassCard style={styles.settingsButton} intensity={60} borderRadius={20}>
              <Ionicons
                name={showSettings ? 'chevron-back' : 'settings-outline'}
                size={20}
                color="#5a5a6e"
              />
            </GlassCard>
          </TouchableOpacity>
        </View>

        <ScrollView
          ref={scrollRef}
          pagingEnabled
          showsVerticalScrollIndicator={false}
          scrollEnabled={false}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Page 1: Timer */}
          <View style={[styles.page, { height: pageHeight }]}>
            <View style={styles.timerContent}>
              <View style={styles.badgeWrap}>
              <GlassCard style={styles.sessionBadge} intensity={55} borderRadius={20}>
                <View style={[styles.sessionBadgeDot, { backgroundColor: activeColor }]} />
                <Text style={styles.sessionBadgeText}>
                  {getSessionLabel(sessionType)}
                </Text>
              </GlassCard>
              </View>

              <View style={styles.timerContainer}>
                <GlassCard style={styles.timerCard} intensity={80} borderRadius={180}>
                  <ProgressCircle
                    progress={progress}
                    size={240}
                    strokeWidth={6}
                    progressColor={activeColor}
                    trackColor="rgba(255,255,255,0.3)"
                  >
                    <TimerDisplay
                      timeRemaining={timeRemaining}
                      sessionType={sessionType}
                      currentSession={currentSession}
                      sessionsBeforeLongBreak={settings.sessionsBeforeLongBreak}
                      textColor="#2a2a3c"
                      secondaryTextColor="#7a7a8e"
                    />
                  </ProgressCircle>
                </GlassCard>
              </View>

              <SessionDots
                total={settings.sessionsBeforeLongBreak}
                completed={completedSessions}
                activeColor={timerColor}
                breakColor={breakColor}
                inactiveColor="rgba(255,255,255,0.4)"
                breakSessions={breakSessions}
                isOnBreak={isOnBreak}
                currentSession={currentSession}
              />

              <TimerControls
                status={status}
                onPlay={play}
                onPause={pause}
                onRestart={restart}
                onSkip={skip}
                primaryColor={activeColor}
                secondaryColor="rgba(255,255,255,0.6)"
                textColor="#2a2a3c"
                iconColor="#5a5a6e"
                borderColor="rgba(255,255,255,0.65)"
              />

              <TimeAdjustmentSlider
                visible={true}
                onAdjust={adjustTime}
                onClose={() => {}}
                primaryColor={activeColor}
                surfaceColor="rgba(255,255,255,0.7)"
                textColor="#2a2a3c"
                secondaryTextColor="#7a7a8e"
                borderColor="rgba(255,255,255,0.6)"
                timeRemainingSeconds={timeRemaining}
              />
            </View>
          </View>

          {/* Page 2: Settings */}
          <View style={[styles.page, { height: pageHeight }]}>
            <ScrollView
              ref={settingsScrollRef}
              style={styles.settingsScroll}
              contentContainerStyle={styles.settingsScrollContent}
              showsVerticalScrollIndicator={false}
              nestedScrollEnabled={true}
            >
                <View>
                  {/* Timer Durations */}
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Durations</Text>
                    <GlassCard style={styles.sectionCard} intensity={60} borderRadius={20}>
                      <SettingRow
                        label="Focus"
                        numericValue={settings.workDuration}
                        suffix="min"
                        onDecrement={() => {
                          const v = settings.workDuration;
                          const snapped = v % 5 === 0 ? v - 5 : Math.floor(v / 5) * 5;
                          updateSettings({ workDuration: Math.max(1, snapped) });
                        }}
                        onIncrement={() => {
                          const v = settings.workDuration;
                          const snapped = v % 5 === 0 ? v + 5 : Math.ceil(v / 5) * 5;
                          updateSettings({ workDuration: Math.min(120, snapped) });
                        }}
                        onCustomValue={(v) => updateSettings({ workDuration: Math.max(1, Math.min(120, v)) })}
                        accentColor={timerColor}
                      />
                      <View style={styles.divider} />
                      <SettingRow
                        label="Short Break"
                        numericValue={settings.shortBreakDuration}
                        suffix="min"
                        onDecrement={() =>
                          updateSettings({ shortBreakDuration: Math.max(1, settings.shortBreakDuration - 1) })
                        }
                        onIncrement={() =>
                          updateSettings({ shortBreakDuration: Math.min(30, settings.shortBreakDuration + 1) })
                        }
                        onCustomValue={(v) => updateSettings({ shortBreakDuration: Math.max(1, Math.min(30, v)) })}
                        accentColor={breakColor}
                      />
                      <View style={styles.divider} />
                      <SettingRow
                        label="Long Break"
                        numericValue={settings.longBreakDuration}
                        suffix="min"
                        onDecrement={() => {
                          const v = settings.longBreakDuration;
                          const snapped = v % 5 === 0 ? v - 5 : Math.floor(v / 5) * 5;
                          updateSettings({ longBreakDuration: Math.max(1, snapped) });
                        }}
                        onIncrement={() => {
                          const v = settings.longBreakDuration;
                          const snapped = v % 5 === 0 ? v + 5 : Math.ceil(v / 5) * 5;
                          updateSettings({ longBreakDuration: Math.min(60, snapped) });
                        }}
                        onCustomValue={(v) => updateSettings({ longBreakDuration: Math.max(1, Math.min(60, v)) })}
                        accentColor={breakColor}
                      />
                      <View style={styles.divider} />
                      <SettingRow
                        label="Sessions"
                        numericValue={settings.sessionsBeforeLongBreak}
                        suffix=""
                        onDecrement={() =>
                          updateSettings({ sessionsBeforeLongBreak: Math.max(1, settings.sessionsBeforeLongBreak - 1) })
                        }
                        onIncrement={() =>
                          updateSettings({ sessionsBeforeLongBreak: Math.min(10, settings.sessionsBeforeLongBreak + 1) })
                        }
                        onCustomValue={(v) => updateSettings({ sessionsBeforeLongBreak: Math.max(1, Math.min(10, v)) })}
                        accentColor={timerColor}
                      />
                    </GlassCard>
                  </View>

                  {/* Behavior */}
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Behavior</Text>
                    <GlassCard style={styles.sectionCard} intensity={60} borderRadius={20}>
                      <ToggleRow
                        label="Auto-start Breaks"
                        value={settings.autoStartBreaks}
                        onToggle={(v) => updateSettings({ autoStartBreaks: v })}
                        accentColor={timerColor}
                      />
                      <View style={styles.divider} />
                      <ToggleRow
                        label="Auto-start Work"
                        value={settings.autoStartWork}
                        onToggle={(v) => updateSettings({ autoStartWork: v })}
                        accentColor={timerColor}
                      />
                      <View style={styles.divider} />
                      <ToggleRow
                        label="Keep Screen Awake"
                        value={settings.keepScreenAwake}
                        onToggle={(v) => updateSettings({ keepScreenAwake: v })}
                        accentColor={timerColor}
                      />
                    </GlassCard>
                  </View>

                  {/* Notifications */}
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Notifications</Text>
                    <GlassCard style={styles.sectionCard} intensity={60} borderRadius={20}>
                      <ToggleRow
                        label="Sound"
                        value={settings.soundEnabled}
                        onToggle={(v) => updateSettings({ soundEnabled: v })}
                        accentColor={timerColor}
                      />
                      <View style={styles.divider} />
                      <ToggleRow
                        label="Vibration"
                        value={settings.vibrationEnabled}
                        onToggle={(v) => updateSettings({ vibrationEnabled: v })}
                        accentColor={timerColor}
                      />
                      <View style={styles.divider} />
                      <ToggleRow
                        label="Ticking Sound"
                        value={settings.tickingSound}
                        onToggle={(v) => updateSettings({ tickingSound: v })}
                        accentColor={timerColor}
                      />
                    </GlassCard>
                  </View>

                  {/* Timer Color */}
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Focus Color</Text>
                    <GlassCard style={styles.sectionCard} intensity={60} borderRadius={20}>
                      <View style={styles.colorGrid}>
                        {COLOR_OPTIONS.map((opt: { label: string; value: string }) => (
                          <TouchableOpacity
                            key={opt.value}
                            style={styles.colorOption}
                            onPress={() => { updateSettings({ timerColor: opt.value }); setShowCustomTimer(false); }}
                          >
                            <View
                              style={[
                                styles.colorSwatch,
                                { backgroundColor: opt.value },
                                settings.timerColor === opt.value && !showCustomTimer && styles.colorSwatchSelected,
                              ]}
                            >
                              {settings.timerColor === opt.value && !showCustomTimer && (
                                <Ionicons name="checkmark" size={14} color="#fff" />
                              )}
                            </View>
                            <Text style={styles.colorLabel}>{opt.label}</Text>
                          </TouchableOpacity>
                        ))}
                        <TouchableOpacity
                          style={styles.colorOption}
                          onPress={() => setShowCustomTimer(!showCustomTimer)}
                        >
                          <View style={[styles.colorSwatch, styles.customSwatch, showCustomTimer && styles.colorSwatchSelected]}>
                            <Ionicons name="color-palette-outline" size={16} color="#7a7a8e" />
                          </View>
                          <Text style={styles.colorLabel}>Custom</Text>
                        </TouchableOpacity>
                      </View>
                      <ColorSpectrum
                        visible={showCustomTimer}
                        currentColor={timerColor}
                        onSelect={(c) => updateSettings({ timerColor: c })}
                        onClose={() => setShowCustomTimer(false)}
                      />
                    </GlassCard>
                  </View>

                  {/* Break Color */}
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Break Color</Text>
                    <GlassCard style={styles.sectionCard} intensity={60} borderRadius={20}>
                      <View style={styles.colorGrid}>
                        {COLOR_OPTIONS.map((opt: { label: string; value: string }) => (
                          <TouchableOpacity
                            key={opt.value}
                            style={styles.colorOption}
                            onPress={() => { updateSettings({ breakColor: opt.value }); setShowCustomBreak(false); }}
                          >
                            <View
                              style={[
                                styles.colorSwatch,
                                { backgroundColor: opt.value },
                                settings.breakColor === opt.value && !showCustomBreak && styles.colorSwatchSelected,
                              ]}
                            >
                              {settings.breakColor === opt.value && !showCustomBreak && (
                                <Ionicons name="checkmark" size={14} color="#fff" />
                              )}
                            </View>
                            <Text style={styles.colorLabel}>{opt.label}</Text>
                          </TouchableOpacity>
                        ))}
                        <TouchableOpacity
                          style={styles.colorOption}
                          onPress={() => setShowCustomBreak(!showCustomBreak)}
                        >
                          <View style={[styles.colorSwatch, styles.customSwatch, showCustomBreak && styles.colorSwatchSelected]}>
                            <Ionicons name="color-palette-outline" size={16} color="#7a7a8e" />
                          </View>
                          <Text style={styles.colorLabel}>Custom</Text>
                        </TouchableOpacity>
                      </View>
                      <ColorSpectrum
                        visible={showCustomBreak}
                        currentColor={breakColor}
                        onSelect={(c) => updateSettings({ breakColor: c })}
                        onClose={() => setShowCustomBreak(false)}
                      />
                    </GlassCard>
                  </View>

                  {/* Background */}
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Background</Text>
                    <GlassCard style={styles.sectionCard} intensity={60} borderRadius={20}>
                      <View style={styles.colorGrid}>
                        {BACKGROUND_PRESETS.map((preset) => (
                          <TouchableOpacity
                            key={preset.value}
                            style={styles.colorOption}
                            onPress={() => updateSettings({ backgroundPreset: preset.value })}
                          >
                            <View
                              style={[
                                styles.bgSwatch,
                                settings.backgroundPreset === preset.value && styles.colorSwatchSelected,
                              ]}
                            >
                              <View style={[styles.bgSwatchInner, { backgroundColor: preset.gradient[0] }]}>
                                <View style={[styles.bgOrb, { backgroundColor: preset.orbs[0], top: 2, left: 2 }]} />
                                <View style={[styles.bgOrb, { backgroundColor: preset.orbs[1], top: 2, right: 2 }]} />
                                <View style={[styles.bgOrb, { backgroundColor: preset.orbs[2], bottom: 2, left: 8 }]} />
                              </View>
                              {settings.backgroundPreset === preset.value && (
                                <View style={styles.bgCheck}>
                                  <Ionicons name="checkmark" size={12} color="#fff" />
                                </View>
                              )}
                            </View>
                            <Text style={styles.colorLabel}>{preset.label}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </GlassCard>
                  </View>

                  {/* Account */}
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Account</Text>
                    <GlassCard style={styles.sectionCard} intensity={60} borderRadius={20}>
                      {isAuthenticated ? (
                        <View style={styles.accountCard}>
                          <View style={styles.accountInfo}>
                            <View style={[styles.accountAvatar, { backgroundColor: timerColor + '30' }]}>
                              <Ionicons name="person" size={20} color={timerColor} />
                            </View>
                            <View style={styles.accountDetails}>
                              <Text style={styles.accountName}>
                                {user?.user_metadata?.full_name || user?.email || 'Signed In'}
                              </Text>
                              <Text style={styles.accountEmail}>
                                {user?.email || ''}
                              </Text>
                              <Text style={styles.accountSync}>Settings synced</Text>
                            </View>
                          </View>
                          <TouchableOpacity
                            style={styles.signOutBtn}
                            onPress={signOut}
                            activeOpacity={0.7}
                          >
                            <Ionicons name="log-out-outline" size={16} color="#e74c3c" />
                            <Text style={styles.signOutText}>Sign Out</Text>
                          </TouchableOpacity>
                        </View>
                      ) : (
                        <View style={styles.signInCard}>
                          <Text style={styles.signInPrompt}>
                            Sign in to sync your settings across devices
                          </Text>
                          <TouchableOpacity
                            style={styles.oauthBtn}
                            onPress={signInWithGoogle}
                            activeOpacity={0.7}
                          >
                            <Ionicons name="logo-google" size={18} color="#4285F4" />
                            <Text style={styles.oauthBtnText}>Continue with Google</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.oauthBtn}
                            onPress={signInWithApple}
                            activeOpacity={0.7}
                          >
                            <Ionicons name="logo-apple" size={18} color="#000" />
                            <Text style={styles.oauthBtnText}>Continue with Apple</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </GlassCard>
                  </View>

                  <View style={{ height: 100 }} />
                </View>
            </ScrollView>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function SettingRow({
  label,
  numericValue,
  suffix,
  onDecrement,
  onIncrement,
  onCustomValue,
  accentColor,
}: {
  label: string;
  numericValue: number;
  suffix: string;
  onDecrement: () => void;
  onIncrement: () => void;
  onCustomValue: (v: number) => void;
  accentColor: string;
}) {
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState('');

  const startEdit = () => {
    setDraft(String(numericValue));
    setEditing(true);
  };

  const commitEdit = () => {
    setEditing(false);
    const parsed = parseInt(draft, 10);
    if (!isNaN(parsed) && parsed > 0) {
      onCustomValue(parsed);
    }
  };

  const displayText = suffix ? `${numericValue} ${suffix}` : `${numericValue}`;

  return (
    <View style={styles.settingRow}>
      <Text style={styles.settingLabel}>{label}</Text>
      <View style={styles.stepper}>
        <TouchableOpacity style={styles.stepperBtn} onPress={onDecrement}>
          <Ionicons name="remove" size={16} color="#5a5a6e" />
        </TouchableOpacity>
        {editing ? (
          <TextInput
            style={[styles.stepperInput, { color: accentColor, borderColor: accentColor + '40' }]}
            value={draft}
            onChangeText={setDraft}
            onBlur={commitEdit}
            onSubmitEditing={commitEdit}
            keyboardType="number-pad"
            autoFocus
            selectTextOnFocus
            maxLength={3}
          />
        ) : (
          <TouchableOpacity onPress={startEdit}>
            <Text style={[styles.stepperValue, { color: accentColor }]}>{displayText}</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.stepperBtn} onPress={onIncrement}>
          <Ionicons name="add" size={16} color="#5a5a6e" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

function ToggleRow({
  label,
  value,
  onToggle,
  accentColor,
}: {
  label: string;
  value: boolean;
  onToggle: (v: boolean) => void;
  accentColor: string;
}) {
  return (
    <View style={styles.settingRow}>
      <Text style={styles.settingLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: 'rgba(150,150,170,0.3)', true: accentColor + '80' }}
        thumbColor={value ? accentColor : '#ccc'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 4,
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
    color: '#2a2a3c',
  },
  settingsButtonWrap: {
    width: 40,
    height: 40,
  },
  settingsButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    // two pages stacked vertically
  },
  badgeWrap: {
    alignItems: 'center',
  },
  page: {
    // height set dynamically
  },
  timerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 20,
    gap: 12,
  },
  sessionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 7,
    gap: 8,
  },
  sessionBadgeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  sessionBadgeText: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.2,
    color: '#3a3a4c',
  },
  timerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerCard: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  // Settings page
  settingsScroll: {
    flex: 1,
  },
  settingsScrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 10,
    marginLeft: 4,
    color: '#7a7a8e',
  },
  sectionCard: {
    padding: 4,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2a2a3c',
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  stepperBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperValue: {
    fontSize: 15,
    fontWeight: '700',
    minWidth: 52,
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
  },
  stepperInput: {
    fontSize: 15,
    fontWeight: '700',
    minWidth: 52,
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.5)',
    marginLeft: 16,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    gap: 14,
    justifyContent: 'center',
  },
  colorOption: {
    alignItems: 'center',
    gap: 5,
    width: 60,
  },
  colorSwatch: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
    fontSize: 10,
    fontWeight: '500',
    textAlign: 'center',
    color: '#6a6a7e',
  },
  customSwatch: {
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderWidth: 1.5,
    borderColor: 'rgba(150,150,170,0.3)',
    borderStyle: 'dashed',
  },
  customRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingBottom: 12,
    paddingTop: 4,
    gap: 8,
  },
  customHash: {
    fontSize: 15,
    fontWeight: '600',
    color: '#7a7a8e',
  },
  customInputWrap: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  customInput: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2a2a3c',
    fontVariant: ['tabular-nums'],
  },
  customApply: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bgSwatch: {
    width: 40,
    height: 40,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  bgSwatchInner: {
    flex: 1,
    borderRadius: 12,
    position: 'relative',
  },
  bgOrb: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    opacity: 0.7,
  },
  bgCheck: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 12,
  },
  // Account section
  accountCard: {
    padding: 16,
    gap: 14,
  },
  accountInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  accountAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accountDetails: {
    flex: 1,
    gap: 2,
  },
  accountName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2a2a3c',
  },
  accountEmail: {
    fontSize: 12,
    color: '#7a7a8e',
  },
  accountSync: {
    fontSize: 11,
    color: '#5BB8B0',
    fontWeight: '500',
    marginTop: 2,
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(231,76,60,0.08)',
  },
  signOutText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#e74c3c',
  },
  signInCard: {
    padding: 16,
    gap: 12,
    alignItems: 'center',
  },
  signInPrompt: {
    fontSize: 13,
    color: '#7a7a8e',
    textAlign: 'center',
    lineHeight: 18,
  },
  oauthBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    width: '100%',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  oauthBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2a2a3c',
  },
});
