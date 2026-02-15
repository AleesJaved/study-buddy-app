import React from 'react';
import { View, StyleSheet } from 'react-native';

interface SessionDotsProps {
  total: number;
  completed: number;
  activeColor: string;
  breakColor: string;
  inactiveColor: string;
  breakSessions?: Set<number>;
  isOnBreak?: boolean;
  currentSession?: number;
}

export default function SessionDots({
  total,
  completed,
  activeColor,
  breakColor,
  inactiveColor,
  breakSessions = new Set(),
  isOnBreak = false,
  currentSession = 1,
}: SessionDotsProps) {
  return (
    <View style={styles.container}>
      {Array.from({ length: total }, (_, i) => {
        const isCompleted = i < completed;
        const hadBreak = breakSessions.has(i);
        const isCurrentOnBreak = isOnBreak && i === completed - 1;
        // Current focus session dot (the one we're working on right now)
        const isCurrentFocus = !isOnBreak && i === currentSession - 1;

        let dotColor = inactiveColor;
        let isFilled = false;

        if (isCompleted) {
          isFilled = true;
          dotColor = hadBreak || isCurrentOnBreak ? breakColor : activeColor;
        } else if (isCurrentFocus) {
          isFilled = true;
          dotColor = activeColor;
        }

        return (
          <View
            key={i}
            style={[
              styles.dot,
              {
                backgroundColor: dotColor,
                width: isFilled ? 10 : 8,
                height: isFilled ? 10 : 8,
                borderRadius: isFilled ? 5 : 4,
              },
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  dot: {
    borderRadius: 4,
  },
});
