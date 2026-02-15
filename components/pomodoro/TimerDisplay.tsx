import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SessionType } from '../../types/pomodoro.types';

interface TimerDisplayProps {
  timeRemaining: number;
  sessionType: SessionType;
  currentSession: number;
  sessionsBeforeLongBreak: number;
  textColor: string;
  secondaryTextColor: string;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export default function TimerDisplay({
  timeRemaining,
  currentSession,
  sessionsBeforeLongBreak,
  textColor,
  secondaryTextColor,
}: TimerDisplayProps) {
  return (
    <View style={styles.container}>
      <Text style={[styles.time, { color: textColor }]}>
        {formatTime(timeRemaining)}
      </Text>
      <Text style={[styles.sessionCounter, { color: secondaryTextColor }]}>
        {currentSession} / {sessionsBeforeLongBreak}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  time: {
    fontSize: 56,
    fontWeight: '300',
    fontVariant: ['tabular-nums'],
    letterSpacing: 1,
  },
  sessionCounter: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 4,
  },
});
