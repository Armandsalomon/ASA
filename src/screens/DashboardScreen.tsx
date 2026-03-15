import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  RefreshControl, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import { useApp } from '../context/AppContext';
import { getMarketIndices, getMultipleQuotes, StockQuote, MarketIndex, DEFAULT_WATCHLIST } from '../services/marketService';
import { getMarketNews, NewsArticle } from '../services/newsService';
import { RootStackParamList } from '../navigation/AppNavigator';
import MiniChart from '../components/MiniChart';

type NavProp = NativeStackNavigationProp<RootStackParamList>;

const RISK_CONFIG = {
  conservative: { label: 'Conservateur', color: COLORS.conservative, icon: '🛡️' },
  moderate: { label: 'Modéré', color: COLORS.moderate, icon: '⚖️' },
  aggressive: { label: 'Agressif', color: COLORS.aggressive, icon: '🚀' },
};

export default function DashboardScreen() {
  const navigation = useNavigation<NavProp>();
  const { userProfile, portfolio, alphaVantageKey } = useApp();
  const [indices, setIndices] = useState<MarketIndex[]>([]);
  const [watchlist, setWatchlist] = useState<StockQuote[]>([]);
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const riskConfig = RISK_CONFIG[userProfile.riskProfile];

  const portfolioValue = portfolio.reduce((sum, p) => sum + p.shares * p.currentPrice, 0);
  const portfolioCost = portfolio.reduce((sum, p) => sum + p.shares * p.avgPrice, 0);
  const portfolioGain = portfolioValue - portfolioCost;
  const portfolioGainPct = portfolioCost > 0 ? (portfolioGain / portfolioCost) * 100 : 0;

  const loadData = useCallback(async () => {
    try {
      const [indexData, quoteData, newsData] = await Promise.all([
        getMarketIndices(),
        getMultipleQuotes(DEFAULT_WATCHLIST.slice(0, 6), alphaVantageKey),
        getMarketNews(alphaVantageKey),
      ]);
      setIndices(indexData);
      setWatchlist(quoteData);
      setNews(newsData.slice(0, 3));
    } catch (error) {
      console.error('Dashboard load error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [alphaVantageKey]);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 60000); // refresh every minute
    return () => clearInterval(interval);
  }, [loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bonjour';
    if (hour < 18) return 'Bon après-midi';
    return 'Bonsoir';
  };

  const getMarketStatus = () => {
    const now = new Date();
    const hour = now.getUTCHours();
    const day = now.getDay();
    const isWeekend = day === 0 || day === 6;
    const isNYSEOpen = !isWeekend && hour >= 14 && hour < 21; // UTC 14:30 - 21:00
    return isNYSEOpen
      ? { open: true, label: 'NYSE ouvert', color: COLORS.gain }
      : { open: false, label: 'Marchés fermés', color: COLORS.textMuted };
  };

  const marketStatus = getMarketStatus();

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Chargement des marchés...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <View style={styles.profileRow}>
              <Text style={[styles.profileBadge, { color: riskConfig.color }]}>
                {riskConfig.icon} {riskConfig.label}
              </Text>
              <View style={[styles.marketStatus, { backgroundColor: marketStatus.color + '20' }]}>
                <View style={[styles.statusDot, { backgroundColor: marketStatus.color }]} />
                <Text style={[styles.statusText, { color: marketStatus.color }]}>
                  {marketStatus.label}
                </Text>
              </View>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate('Settings')}
            style={styles.settingsBtn}
          >
            <Ionicons name="settings-outline" size={22} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
        >
          {/* Portfolio Summary */}
          {portfolio.length > 0 && (
            <View style={styles.section}>
              <LinearGradient
                colors={[COLORS.card, COLORS.cardElevated]}
                style={styles.portfolioCard}
              >
                <Text style={styles.portfolioLabel}>Mon Portefeuille</Text>
                <Text style={styles.portfolioValue}>
                  {portfolioValue.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                </Text>
                <View style={styles.portfolioGain}>
                  <Ionicons
                    name={portfolioGain >= 0 ? 'trending-up' : 'trending-down'}
                    size={16}
                    color={portfolioGain >= 0 ? COLORS.gain : COLORS.loss}
                  />
                  <Text style={[styles.gainText, { color: portfolioGain >= 0 ? COLORS.gain : COLORS.loss }]}>
                    {portfolioGain >= 0 ? '+' : ''}{portfolioGain.toFixed(0)}€ ({portfolioGain >= 0 ? '+' : ''}{portfolioGainPct.toFixed(2)}%)
                  </Text>
                </View>
              </LinearGradient>
            </View>
          )}

          {/* Quick Advisor CTA */}
          <TouchableOpacity
            style={styles.section}
            onPress={() => navigation.navigate('Main', { screen: 'Advisor' } as any)}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[COLORS.primary + '20', COLORS.primary + '08']}
              style={styles.advisorCTA}
            >
              <View style={styles.advisorCTALeft}>
                <Text style={styles.advisorCTATitle}>🤖 Conseiller IA</Text>
                <Text style={styles.advisorCTASubtitle}>
                  Demandez une analyse ou une recommandation
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={COLORS.primary} />
            </LinearGradient>
          </TouchableOpacity>

          {/* Market Indices */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Indices Mondiaux</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.indicesScroll}>
              {indices.map(index => (
                <View key={index.ticker} style={styles.indexCard}>
                  <Text style={styles.indexName}>{index.name}</Text>
                  <Text style={styles.indexValue}>{index.value.toLocaleString('fr-FR')}</Text>
                  <Text style={[
                    styles.indexChange,
                    { color: index.changePercent >= 0 ? COLORS.gain : COLORS.loss }
                  ]}>
                    {index.changePercent >= 0 ? '+' : ''}{index.changePercent.toFixed(2)}%
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>

          {/* Watchlist */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Ma Watchlist</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Main', { screen: 'Market' } as any)}>
                <Text style={styles.sectionLink}>Voir tout</Text>
              </TouchableOpacity>
            </View>
            {watchlist.map(stock => (
              <TouchableOpacity
                key={stock.ticker}
                style={styles.stockRow}
                onPress={() => navigation.navigate('StockDetail', { ticker: stock.ticker })}
                activeOpacity={0.7}
              >
                <View style={styles.stockLeft}>
                  <View style={styles.tickerBadge}>
                    <Text style={styles.tickerText}>{stock.ticker.slice(0, 4)}</Text>
                  </View>
                  <View>
                    <Text style={styles.stockName} numberOfLines={1}>{stock.name}</Text>
                    <Text style={styles.stockVolume}>
                      Vol: {(stock.volume / 1_000_000).toFixed(1)}M
                    </Text>
                  </View>
                </View>
                <MiniChart data={[]} positive={stock.changePercent >= 0} />
                <View style={styles.stockRight}>
                  <Text style={styles.stockPrice}>{stock.price.toFixed(2)}€</Text>
                  <View style={[
                    styles.changeBadge,
                    { backgroundColor: stock.changePercent >= 0 ? COLORS.gain + '20' : COLORS.loss + '20' }
                  ]}>
                    <Text style={[
                      styles.changeText,
                      { color: stock.changePercent >= 0 ? COLORS.gain : COLORS.loss }
                    ]}>
                      {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Latest News */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Actualités</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Main', { screen: 'Market' } as any)}>
                <Text style={styles.sectionLink}>Voir tout</Text>
              </TouchableOpacity>
            </View>
            {news.map(article => (
              <View key={article.id} style={styles.newsCard}>
                <View style={styles.newsHeader}>
                  <View style={[
                    styles.sentimentBadge,
                    {
                      backgroundColor:
                        article.sentiment === 'positive' ? COLORS.gain + '20' :
                        article.sentiment === 'negative' ? COLORS.loss + '20' : COLORS.warning + '20'
                    }
                  ]}>
                    <Text style={[
                      styles.sentimentText,
                      {
                        color:
                          article.sentiment === 'positive' ? COLORS.gain :
                          article.sentiment === 'negative' ? COLORS.loss : COLORS.warning
                      }
                    ]}>
                      {article.sentiment === 'positive' ? '↑ Positif' :
                       article.sentiment === 'negative' ? '↓ Négatif' : '→ Neutre'}
                    </Text>
                  </View>
                  <Text style={styles.newsSource}>{article.source}</Text>
                </View>
                <Text style={styles.newsTitle} numberOfLines={2}>{article.title}</Text>
              </View>
            ))}
          </View>

          {/* Disclaimer */}
          <View style={styles.disclaimerBox}>
            <Text style={styles.disclaimerText}>
              ⚠️ ASA est un outil d'analyse informatif. Il ne constitue pas un conseil financier réglementé. Consultez un professionnel avant tout investissement.
            </Text>
          </View>
          <View style={{ height: SPACING.xl }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  safeArea: { flex: 1 },
  loading: { flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center', gap: SPACING.md },
  loadingText: { color: COLORS.textSecondary, fontSize: FONTS.sizes.md },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.md,
  },
  greeting: { fontSize: FONTS.sizes.xxl, fontWeight: FONTS.weights.bold, color: COLORS.text },
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginTop: 4 },
  profileBadge: { fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.semibold },
  marketStatus: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: RADIUS.full },
  statusDot: { width: 6, height: 6, borderRadius: RADIUS.full },
  statusText: { fontSize: FONTS.sizes.xs, fontWeight: FONTS.weights.semibold },
  settingsBtn: { padding: SPACING.sm, backgroundColor: COLORS.card, borderRadius: RADIUS.full },
  section: { paddingHorizontal: SPACING.base, marginBottom: SPACING.lg },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md },
  sectionTitle: { fontSize: FONTS.sizes.lg, fontWeight: FONTS.weights.bold, color: COLORS.text, marginBottom: SPACING.md },
  sectionLink: { fontSize: FONTS.sizes.sm, color: COLORS.primary },
  portfolioCard: { borderRadius: RADIUS.xl, padding: SPACING.xl, ...SHADOWS.card },
  portfolioLabel: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, marginBottom: SPACING.sm },
  portfolioValue: { fontSize: FONTS.sizes.xxxl, fontWeight: FONTS.weights.extrabold, color: COLORS.text },
  portfolioGain: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, marginTop: SPACING.xs },
  gainText: { fontSize: FONTS.sizes.base, fontWeight: FONTS.weights.semibold },
  advisorCTA: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: RADIUS.xl,
    padding: SPACING.base,
    borderWidth: 1,
    borderColor: COLORS.primary + '40',
  },
  advisorCTALeft: { flex: 1 },
  advisorCTATitle: { fontSize: FONTS.sizes.base, fontWeight: FONTS.weights.bold, color: COLORS.text },
  advisorCTASubtitle: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, marginTop: 2 },
  indicesScroll: { marginHorizontal: -SPACING.base, paddingHorizontal: SPACING.base },
  indexCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.base,
    marginRight: SPACING.md,
    minWidth: 120,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  indexName: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, marginBottom: 4 },
  indexValue: { fontSize: FONTS.sizes.base, fontWeight: FONTS.weights.bold, color: COLORS.text },
  indexChange: { fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.semibold, marginTop: 2 },
  stockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  stockLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  tickerBadge: {
    width: 44,
    height: 44,
    backgroundColor: COLORS.cardElevated,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tickerText: { fontSize: FONTS.sizes.xs, fontWeight: FONTS.weights.bold, color: COLORS.primary },
  stockName: { fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.semibold, color: COLORS.text, maxWidth: 100 },
  stockVolume: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted },
  stockRight: { alignItems: 'flex-end', gap: 4 },
  stockPrice: { fontSize: FONTS.sizes.base, fontWeight: FONTS.weights.bold, color: COLORS.text },
  changeBadge: { paddingHorizontal: SPACING.sm, paddingVertical: 2, borderRadius: RADIUS.sm },
  changeText: { fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.semibold },
  newsCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  newsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm },
  sentimentBadge: { paddingHorizontal: SPACING.sm, paddingVertical: 2, borderRadius: RADIUS.sm },
  sentimentText: { fontSize: FONTS.sizes.xs, fontWeight: FONTS.weights.semibold },
  newsSource: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted },
  newsTitle: { fontSize: FONTS.sizes.sm, color: COLORS.text, lineHeight: 18, fontWeight: FONTS.weights.medium },
  disclaimerBox: {
    marginHorizontal: SPACING.base,
    backgroundColor: COLORS.warning + '15',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.warning + '30',
  },
  disclaimerText: { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary, lineHeight: 16 },
});
