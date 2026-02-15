import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const DEFAULT_GRADIENT = ['#e8dff5', '#c9e4f6', '#f0e6f6', '#d4eef9'];
const DEFAULT_ORBS = ['#b8a9e8', '#a8e6e2', '#e0b8d8'];

interface GradientBackgroundProps {
  gradientColors?: string[];
  orbColors?: string[];
}

export default function GradientBackground({
  gradientColors = DEFAULT_GRADIENT,
  orbColors = DEFAULT_ORBS,
}: GradientBackgroundProps) {
  const orb1 = orbColors[0] || DEFAULT_ORBS[0];
  const orb2 = orbColors[1] || DEFAULT_ORBS[1];
  const orb3 = orbColors[2] || DEFAULT_ORBS[2];

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient
        colors={gradientColors as any}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <View style={[styles.orb, styles.orbTopLeft]}>
        <LinearGradient
          colors={[orb1, mixColor(orb1, orb2), lighten(orb1)]}
          start={{ x: 0.2, y: 0 }}
          end={{ x: 0.8, y: 1 }}
          style={styles.orbGradient}
        />
      </View>

      <View style={[styles.orb, styles.orbTopRight]}>
        <LinearGradient
          colors={[orb2, mixColor(orb2, orb1), lighten(orb2)]}
          start={{ x: 0, y: 0.3 }}
          end={{ x: 1, y: 0.7 }}
          style={styles.orbGradient}
        />
      </View>

      <View style={[styles.orb, styles.orbBottomRight]}>
        <LinearGradient
          colors={[orb3, mixColor(orb3, orb1), lighten(orb3)]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.orbGradient}
        />
      </View>

      <View style={[styles.orb, styles.orbCenterLeft]}>
        <LinearGradient
          colors={[mixColor(orb1, orb2), lighten(orb2), mixColor(orb2, orb3)]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={styles.orbGradient}
        />
      </View>

      <View style={[styles.orb, styles.orbBottomLeft]}>
        <LinearGradient
          colors={[mixColor(orb3, orb1), lighten(orb1), mixColor(orb1, orb3)]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.orbGradient}
        />
      </View>
    </View>
  );
}

function hexToRgb(hex: string) {
  const h = hex.replace('#', '');
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

function rgbToHex(r: number, g: number, b: number) {
  return '#' + [r, g, b].map(c => Math.max(0, Math.min(255, Math.round(c))).toString(16).padStart(2, '0')).join('');
}

function mixColor(a: string, b: string) {
  const [r1, g1, b1] = hexToRgb(a);
  const [r2, g2, b2] = hexToRgb(b);
  return rgbToHex((r1 + r2) / 2, (g1 + g2) / 2, (b1 + b2) / 2);
}

function lighten(hex: string) {
  const [r, g, b] = hexToRgb(hex);
  return rgbToHex(r + (255 - r) * 0.3, g + (255 - g) * 0.3, b + (255 - b) * 0.3);
}

const styles = StyleSheet.create({
  orb: {
    position: 'absolute',
    borderRadius: 9999,
    overflow: 'hidden',
  },
  orbGradient: {
    flex: 1,
    borderRadius: 9999,
  },
  orbTopLeft: {
    top: -height * 0.08,
    left: -width * 0.15,
    width: width * 0.7,
    height: width * 0.7,
    opacity: 0.7,
  },
  orbTopRight: {
    top: -height * 0.05,
    right: -width * 0.2,
    width: width * 0.55,
    height: width * 0.55,
    opacity: 0.6,
  },
  orbBottomRight: {
    bottom: -height * 0.06,
    right: -width * 0.1,
    width: width * 0.6,
    height: width * 0.6,
    opacity: 0.55,
  },
  orbCenterLeft: {
    top: height * 0.35,
    left: -width * 0.1,
    width: width * 0.35,
    height: width * 0.35,
    opacity: 0.4,
  },
  orbBottomLeft: {
    bottom: height * 0.15,
    left: width * 0.05,
    width: width * 0.2,
    height: width * 0.2,
    opacity: 0.35,
  },
});
