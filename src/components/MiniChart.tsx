import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Polyline, Defs, LinearGradient, Stop, Path } from 'react-native-svg';
import { COLORS } from '../constants/theme';

interface MiniChartProps {
  data?: number[];
  positive: boolean;
  width?: number;
  height?: number;
}

function generateMockData(positive: boolean): number[] {
  const points: number[] = [50];
  for (let i = 1; i < 10; i++) {
    const trend = positive ? 0.6 : 0.4;
    const prev = points[i - 1];
    const next = prev + (Math.random() > trend ? -1 : 1) * Math.random() * 8;
    points.push(Math.max(10, Math.min(90, next)));
  }
  if (positive) points[9] = Math.max(points[9], points[0]);
  else points[9] = Math.min(points[9], points[0]);
  return points;
}

export default function MiniChart({ data, positive, width = 60, height = 30 }: MiniChartProps) {
  const values = data && data.length > 1 ? data : generateMockData(positive);
  const color = positive ? COLORS.gain : COLORS.loss;

  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const range = maxVal - minVal || 1;

  const points = values.map((v, i) => {
    const x = (i / (values.length - 1)) * width;
    const y = height - ((v - minVal) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <View style={[styles.container, { width, height }]}>
      <Svg width={width} height={height}>
        <Polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth={1.5}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { overflow: 'hidden' },
});
