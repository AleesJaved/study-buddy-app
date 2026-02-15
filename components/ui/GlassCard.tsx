import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, ViewStyle, Platform } from 'react-native';
import { BlurView } from 'expo-blur';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: number;
  borderRadius?: number;
}

function WebGlassCard({
  children,
  style,
  borderRadius = 24,
}: Omit<GlassCardProps, 'intensity'>) {
  const ref = useRef<View>(null);

  useEffect(() => {
    if (ref.current) {
      const node = ref.current as any;
      if (node.style) {
        node.style.backdropFilter = 'blur(40px)';
        node.style.webkitBackdropFilter = 'blur(40px)';
      } else if (node._nativeTag || node.getNode) {
        // fallback: no-op
      }
    }
  }, []);

  return (
    <View
      ref={ref}
      style={[
        styles.webGlass,
        { borderRadius },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export default function GlassCard({
  children,
  style,
  intensity = 80,
  borderRadius = 24,
}: GlassCardProps) {
  if (Platform.OS === 'web') {
    return (
      <WebGlassCard style={style} borderRadius={borderRadius}>
        {children}
      </WebGlassCard>
    );
  }

  return (
    <View style={[styles.container, { borderRadius }, style]}>
      <BlurView
        intensity={intensity}
        tint="light"
        style={[StyleSheet.absoluteFill, { borderRadius, overflow: 'hidden' }]}
      />
      <View style={[styles.overlay, { borderRadius }]} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
  },
  webGlass: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    overflow: 'hidden',
  } as any,
});
