import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import GlassCard from '../ui/GlassCard';

const TRACK_W = 240;
const TRACK_H = 4;
const THUMB_SIZE = 22;
const MAX_ADD = 60;

interface TimeAdjustmentSliderProps {
  visible: boolean;
  onAdjust: (minutes: number) => void;
  onClose: () => void;
  primaryColor: string;
  surfaceColor: string;
  textColor: string;
  secondaryTextColor: string;
  borderColor: string;
  timeRemainingSeconds?: number;
}

export default function TimeAdjustmentSlider({
  visible,
  onAdjust,
  onClose,
  primaryColor,
  surfaceColor,
  textColor,
  secondaryTextColor,
  borderColor,
  timeRemainingSeconds = 0,
}: TimeAdjustmentSliderProps) {
  const [value, setValue] = useState(0);
  const dragging = useRef(false);
  const trackElRef = useRef<any>(null);

  const usable = TRACK_W - THUMB_SIZE;

  // Always show full -60 to +60 range, but gray out the unusable part
  const maxSubtract = Math.min(Math.floor(timeRemainingSeconds / 60), MAX_ADD);

  if (!visible) return null;

  const valToX = (v: number) => ((v + MAX_ADD) / (MAX_ADD * 2)) * usable;
  const xToVal = (x: number) => {
    const ratio = Math.max(0, Math.min(1, x / usable));
    const raw = Math.round(ratio * MAX_ADD * 2 - MAX_ADD);
    // Clamp to usable range
    return Math.max(-maxSubtract, Math.min(MAX_ADD, raw));
  };

  const thumbX = valToX(value);
  const zeroX = valToX(0);

  // Grayed-out zone: from left edge to the usable min
  const grayEndX = valToX(-maxSubtract) + THUMB_SIZE / 2;

  const handleApply = () => {
    if (value !== 0) onAdjust(value);
    setValue(0);
    onClose();
  };

  const updateFromClientX = (clientX: number) => {
    const el = trackElRef.current;
    if (!el) return;
    let rect: DOMRect;
    if (el.getBoundingClientRect) {
      rect = el.getBoundingClientRect();
    } else if (el.measure) {
      // native fallback - handled by PanResponder
      return;
    } else {
      return;
    }
    const x = clientX - rect.left - THUMB_SIZE / 2;
    setValue(xToVal(x));
  };

  // Web: global pointer listeners for drag
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const onMove = (e: PointerEvent) => {
      if (!dragging.current) return;
      e.preventDefault();
      updateFromClientX(e.clientX);
    };
    const onUp = () => { dragging.current = false; };
    document.addEventListener('pointermove', onMove, { passive: false });
    document.addEventListener('pointerup', onUp);
    return () => {
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
    };
  }, [maxSubtract]);

  const onPointerDown = (e: any) => {
    dragging.current = true;
    const clientX = e.clientX ?? e.nativeEvent?.pageX ?? 0;
    updateFromClientX(clientX);
  };

  const sign = value > 0 ? '+' : '';
  const fillLeft = value >= 0
    ? zeroX + THUMB_SIZE / 2
    : thumbX + THUMB_SIZE / 2;
  const fillW = Math.abs(thumbX - zeroX);

  const webProps = Platform.OS === 'web'
    ? { onPointerDown, ref: (el: any) => { trackElRef.current = el; } } as any
    : {};

  return (
    <View style={styles.wrapper}>
      <Text style={[styles.label, { color: value === 0 ? secondaryTextColor : primaryColor }]}>
        {value === 0 ? 'Adjust' : `${sign}${value} min`}
      </Text>

      <View style={styles.sliderArea}>
      <View style={styles.trackOuter} {...webProps}>
        {/* Full track background */}
        <View style={styles.trackBg} />

        {/* Grayed-out unusable zone on the left */}
        {grayEndX > THUMB_SIZE / 2 && (
          <View
            style={[
              styles.grayZone,
              { left: THUMB_SIZE / 2, width: grayEndX - THUMB_SIZE / 2 },
            ]}
          />
        )}

        {/* Fill from zero to thumb */}
        {value !== 0 && (
          <View
            style={[
              styles.trackFill,
              { left: fillLeft, width: fillW, backgroundColor: primaryColor + '70' },
            ]}
          />
        )}

        {/* Zero tick */}
        <View style={[styles.zeroTick, { left: zeroX + THUMB_SIZE / 2 - 0.5 }]} />

        {/* Thumb */}
        <GlassCard
          style={[styles.thumb, { left: thumbX }] as any}
          intensity={80}
          borderRadius={THUMB_SIZE / 2}
        >
          <View style={[styles.thumbDot, { backgroundColor: value === 0 ? '#bbb' : primaryColor }]} />
        </GlassCard>
      </View>

      <View style={styles.rangeRow}>
        <Text style={[styles.rangeText, { color: secondaryTextColor }]}>-{MAX_ADD}</Text>
        <Text style={[styles.rangeText, { color: secondaryTextColor }]}>0</Text>
        <Text style={[styles.rangeText, { color: secondaryTextColor }]}>+{MAX_ADD}</Text>
      </View>

      <View style={styles.applyArea}>
        {value !== 0 && (
          <View style={styles.applyRow}>
            <TouchableOpacity onPress={handleApply} activeOpacity={0.8}>
              <GlassCard style={styles.applyBtn} intensity={70} borderRadius={12}>
                <View style={[styles.applyOverlay, { backgroundColor: primaryColor }]} />
                <Text style={styles.applyText}>{value > 0 ? 'Add' : 'Remove'} {Math.abs(value)}m</Text>
              </GlassCard>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setValue(0)} activeOpacity={0.7}>
              <GlassCard style={styles.cancelBtn} intensity={60} borderRadius={12}>
                <Ionicons name="close" size={14} color={secondaryTextColor} />
              </GlassCard>
            </TouchableOpacity>
          </View>
        )}
      </View>
      </View>
    </View>
  );
}

const OUTER_H = THUMB_SIZE + 12;

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    gap: 4,
  },
  sliderArea: {
    alignItems: 'center',
    gap: 4,
  },
  applyArea: {
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  trackOuter: {
    width: TRACK_W,
    height: OUTER_H,
    justifyContent: 'center',
    position: 'relative',
    cursor: 'pointer',
  } as any,
  trackBg: {
    position: 'absolute',
    left: THUMB_SIZE / 2,
    right: THUMB_SIZE / 2,
    height: TRACK_H,
    borderRadius: TRACK_H / 2,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  grayZone: {
    position: 'absolute',
    height: TRACK_H,
    top: (OUTER_H - TRACK_H) / 2,
    borderRadius: TRACK_H / 2,
    backgroundColor: 'rgba(0,0,0,0.18)',
  },
  trackFill: {
    position: 'absolute',
    height: TRACK_H,
    top: (OUTER_H - TRACK_H) / 2,
    borderRadius: TRACK_H / 2,
  },
  zeroTick: {
    position: 'absolute',
    width: 1,
    height: 10,
    top: (OUTER_H - 10) / 2,
    backgroundColor: 'rgba(100,100,120,0.25)',
    borderRadius: 0.5,
  },
  thumb: {
    position: 'absolute',
    top: 6,
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    cursor: 'grab',
  } as any,
  thumbDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  rangeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: TRACK_W,
    paddingHorizontal: THUMB_SIZE / 2,
  },
  rangeText: {
    fontSize: 9,
    fontWeight: '500',
    fontVariant: ['tabular-nums'],
  },
  applyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  applyBtn: {
    paddingVertical: 8,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.5,
    borderRadius: 12,
  },
  applyText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
});
