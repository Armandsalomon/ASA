import React from 'react';
import { View, StyleSheet, Text, Dimensions } from 'react-native';
import Svg, { Polyline, Path, Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import { COLORS, FONTS } from '../constants/theme';
import { PricePoint } from '../services/marketService';

const { width: screenWidth } = Dimensions.get('window');
const CHART_WIDTH = screenWidth - 32;
const CHART_HEIGHT = 180;
const PADDING = { top: 10, bottom: 30, left: 8, right: 8 };

interface PriceChartProps {
  data: PricePoint[];
  positive: boolean;
}

export default function PriceChart({ data, positive }: PriceChartProps) {
  if (data.length < 2) return null;

  const color = positive ? COLORS.gain : COLORS.loss;
  const innerWidth = CHART_WIDTH - PADDING.left - PADDING.right;
  const innerHeight = CHART_HEIGHT - PADDING.top - PADDING.bottom;

  const prices = data.map(d => d.close);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const range = maxPrice - minPrice || 1;

  const getX = (i: number) => PADDING.left + (i / (data.length - 1)) * innerWidth;
  const getY = (price: number) => PADDING.top + innerHeight - ((price - minPrice) / range) * innerHeight;

  const linePoints = data.map((d, i) => `${getX(i)},${getY(d.close)}`).join(' ');

  // Area path
  const areaPath = [
    `M ${getX(0)},${getY(data[0].close)}`,
    ...data.slice(1).map((d, i) => `L ${getX(i + 1)},${getY(d.close)}`),
    `L ${getX(data.length - 1)},${CHART_HEIGHT - PADDING.bottom}`,
    `L ${getX(0)},${CHART_HEIGHT - PADDING.bottom}`,
    'Z',
  ].join(' ');

  // Labels
  const firstDate = data[0]?.date.slice(5) || '';
  const lastDate = data[data.length - 1]?.date.slice(5) || '';
  const midDate = data[Math.floor(data.length / 2)]?.date.slice(5) || '';

  return (
    <View style={styles.container}>
      <Svg width={CHART_WIDTH} height={CHART_HEIGHT}>
        <Defs>
          <LinearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={color} stopOpacity="0.3" />
            <Stop offset="1" stopColor={color} stopOpacity="0" />
          </LinearGradient>
        </Defs>

        {/* Area fill */}
        <Path d={areaPath} fill="url(#areaGrad)" />

        {/* Price line */}
        <Polyline
          points={linePoints}
          fill="none"
          stroke={color}
          strokeWidth={2}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </Svg>

      {/* Date labels */}
      <View style={styles.dateLabels}>
        <Text style={styles.dateLabel}>{firstDate}</Text>
        <Text style={styles.dateLabel}>{midDate}</Text>
        <Text style={styles.dateLabel}>{lastDate}</Text>
      </View>

      {/* Price range */}
      <View style={styles.priceRange}>
        <Text style={styles.priceLabel}>Min: {minPrice.toFixed(2)}€</Text>
        <Text style={styles.priceLabel}>Max: {maxPrice.toFixed(2)}€</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: COLORS.card, borderRadius: 14, padding: 0, overflow: 'hidden' },
  dateLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: -8,
  },
  dateLabel: { fontSize: 10, color: COLORS.textMuted },
  priceRange: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 8, borderTopWidth: 1, borderTopColor: COLORS.border },
  priceLabel: { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary },
});
