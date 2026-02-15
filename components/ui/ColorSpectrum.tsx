import React, { useRef, useEffect, useState } from 'react';
import { View, StyleSheet, Platform, Dimensions, TouchableOpacity, Text } from 'react-native';
import GlassCard from './GlassCard';
import { Ionicons } from '@expo/vector-icons';

const GRID_COLS = 12;
const GRID_ROWS = 10;
const SWATCH = 24;
const GAP = 2;
const GRID_W = GRID_COLS * (SWATCH + GAP) - GAP;
const GRID_H = GRID_ROWS * (SWATCH + GAP) - GAP;

interface ColorSpectrumProps {
  visible: boolean;
  currentColor: string;
  onSelect: (color: string) => void;
  onClose: () => void;
}

function hsvToHex(h: number, s: number, v: number): string {
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  let r = 0, g = 0, b = 0;
  if (h < 60) { r = c; g = x; }
  else if (h < 120) { r = x; g = c; }
  else if (h < 180) { g = c; b = x; }
  else if (h < 240) { g = x; b = c; }
  else if (h < 300) { r = x; b = c; }
  else { r = c; b = x; }
  const toHex = (n: number) => Math.round((n + m) * 255).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function generateGrid(): string[][] {
  const grid: string[][] = [];
  for (let row = 0; row < GRID_ROWS; row++) {
    const rowColors: string[] = [];
    // Top row = grays (s=0), bottom rows = full saturation
    // Row 0: grayscale
    if (row === 0) {
      for (let col = 0; col < GRID_COLS; col++) {
        const v = 1 - col / (GRID_COLS - 1);
        rowColors.push(hsvToHex(0, 0, v));
      }
    } else {
      for (let col = 0; col < GRID_COLS; col++) {
        const h = (col / GRID_COLS) * 360;
        const s = 0.3 + (row / (GRID_ROWS - 1)) * 0.7;
        const v = 1.0 - (row - 1) / (GRID_ROWS - 1) * 0.5;
        rowColors.push(hsvToHex(h, s, v));
      }
    }
    grid.push(rowColors);
  }
  return grid;
}

const GRID = generateGrid();

export default function ColorSpectrum({ visible, currentColor, onSelect, onClose }: ColorSpectrumProps) {
  if (!visible) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Pick a Color</Text>
        <TouchableOpacity onPress={onClose} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={14} color="#5a5a6e" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.preview}>
        <View style={[styles.previewSwatch, { backgroundColor: currentColor }]} />
        <Text style={styles.previewHex}>{currentColor.toUpperCase()}</Text>
      </View>

      <View style={styles.grid}>
        {GRID.map((row, ri) => (
          <View key={ri} style={styles.gridRow}>
            {row.map((color, ci) => (
              <TouchableOpacity
                key={ci}
                style={[
                  styles.cell,
                  { backgroundColor: color },
                  currentColor.toLowerCase() === color.toLowerCase() && styles.cellSelected,
                ]}
                onPress={() => onSelect(color)}
                activeOpacity={0.7}
              />
            ))}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingBottom: 12,
    paddingTop: 4,
    gap: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    color: '#5a5a6e',
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  backText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#5a5a6e',
  },
  preview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  previewSwatch: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.6)',
  },
  previewHex: {
    fontSize: 13,
    fontWeight: '600',
    color: '#5a5a6e',
    fontVariant: ['tabular-nums'],
  },
  grid: {
    gap: GAP,
    alignSelf: 'center',
  },
  gridRow: {
    flexDirection: 'row',
    gap: GAP,
  },
  cell: {
    width: SWATCH,
    height: SWATCH,
    borderRadius: 4,
  },
  cellSelected: {
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
});
