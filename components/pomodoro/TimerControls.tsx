import React, { useRef } from 'react';
import { View, TouchableOpacity, StyleSheet, Animated as RNAnimated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TimerStatus } from '../../types/pomodoro.types';
import GlassCard from '../ui/GlassCard';

const AnimatedTouchable = RNAnimated.createAnimatedComponent(TouchableOpacity);

interface TimerControlsProps {
  status: TimerStatus;
  onPlay: () => void;
  onPause: () => void;
  onRestart: () => void;
  onSkip: () => void;
  primaryColor: string;
  secondaryColor: string;
  textColor: string;
  iconColor: string;
  borderColor: string;
}

export default function TimerControls({
  status,
  onPlay,
  onPause,
  onRestart,
  onSkip,
  primaryColor,
  secondaryColor,
  textColor,
  iconColor,
  borderColor,
}: TimerControlsProps) {
  const playScale = useRef(new RNAnimated.Value(1)).current;
  const restartScale = useRef(new RNAnimated.Value(1)).current;
  const skipScale = useRef(new RNAnimated.Value(1)).current;

  const animatePress = (scaleValue: RNAnimated.Value) => {
    RNAnimated.sequence([
      RNAnimated.timing(scaleValue, { toValue: 0.9, duration: 100, useNativeDriver: true }),
      RNAnimated.spring(scaleValue, { toValue: 1, damping: 12, stiffness: 300, useNativeDriver: true }),
    ]).start();
  };

  const handlePlayPause = () => {
    animatePress(playScale);
    if (status === 'running') {
      onPause();
    } else {
      onPlay();
    }
  };

  const handleRestart = () => {
    animatePress(restartScale);
    onRestart();
  };

  const handleSkip = () => {
    animatePress(skipScale);
    onSkip();
  };

  return (
    <View style={styles.container}>
      <View style={styles.controls}>
        <AnimatedTouchable
          style={[{ transform: [{ scale: restartScale }] }]}
          onPress={handleRestart}
          activeOpacity={0.7}
        >
          <GlassCard style={styles.secondaryButton} intensity={60} borderRadius={24}>
            <Ionicons name="refresh" size={20} color={iconColor} />
          </GlassCard>
        </AnimatedTouchable>

        <AnimatedTouchable
          style={[{ transform: [{ scale: playScale }] }]}
          onPress={handlePlayPause}
          activeOpacity={0.8}
        >
          <GlassCard style={styles.playButton} intensity={80} borderRadius={32}>
            <View style={[styles.playColorOverlay, { backgroundColor: primaryColor }]} />
            <Ionicons
              name={status === 'running' ? 'pause' : 'play'}
              size={32}
              color="#ffffff"
              style={status !== 'running' ? { marginLeft: 3 } : undefined}
            />
          </GlassCard>
        </AnimatedTouchable>

        <AnimatedTouchable
          style={[{ transform: [{ scale: skipScale }] }]}
          onPress={handleSkip}
          activeOpacity={0.7}
        >
          <GlassCard style={styles.secondaryButton} intensity={60} borderRadius={24}>
            <Ionicons name="play-skip-forward" size={20} color={iconColor} />
          </GlassCard>
        </AnimatedTouchable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 16,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  playButton: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playColorOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.55,
    borderRadius: 32,
  },
  secondaryButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
