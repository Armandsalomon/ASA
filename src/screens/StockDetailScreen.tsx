import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS, FONTS, SPACING, RADIUS } from '../constants/theme';
import { getStockQuote, getPriceHistory, StockQuote, PricePoint } from '../services/marketService';
import { getNewsForTicker, NewsArticle } from '../services/newsService';
import { getQuickAnalysis } from '../services/claudeService';
import { useApp } from '../context/AppContext';
import { RootStackParamList } from '../navigation/AppNavigator';
import PriceChart from '../components/PriceChart';

type NavProp = NativeStackNavigationProp<RootStackParamList>;
type RouteType = RouteProp<RootStackParamList, 'StockDetail'>;

export default function StockDetailScreen() {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RouteType>();
  const { ticker } = route.params;
  const { alphaVantageKey, anthropicKey, addPosition } = useApp();

  const [quote, setQuote] = useState<StockQuote | null>(null);
  const [history, setHistory] = useState<PricePoint[]>([]);
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [analysis, setAnalysis] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [analysisLoading, setAnalysisLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, [ticker]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [quoteData, historyData, newsData] = await Promise.all([
        getStockQuote(ticker, alphaVantageKey),
        getPriceHistory(ticker, alphaVantageKey),
        getNewsForTicker(ticker, alphaVantageKey),
      ]);
      setQuote(quoteData);
      setHistory(historyData);
      setNews(newsData);
    } catch (error) {
      console.error('Stock detail error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGetAnalysis = async () => {
    if (!anthropicKey) {
      setAnalysis('⚙️ Configurez votre clé API Anthropic dans les Paramètres pour accéder aux analyses IA.');
      return;
    }
    setAnalysisLoading(true);
    const result = await getQuickAnalysis(ticker, anthropicKey);
    setAnalysis(result);
    setAnalysisLoading(false);
  };

  const handleAddToPortfolio = () => {
    if (!quote) return;
    addPosition({
      ticker,
      name: quote.name,
      shares: 1,
      avgPrice: quote.price,
      currentPrice: quote.price,
    });
  };

  if (loading || !quote) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Chargement de {ticker}...</Text>
      </View>
    );
  }

  const isPositive = quote.changePercent >= 0;
  const priceChangePercent = quote.changePercent;

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <View style={styles.headerTitle}>
            <Text style={styles.tickerText}>{ticker}</Text>
            <Text style={styles.nameText} numberOfLines={1}>{quote.name}</Text>
          </View>
          <TouchableOpacity style={styles.addBtn} onPress={handleAddToPortfolio}>
            <Ionicons name="add-circle-outline" size={28} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Price */}
          <View style={styles.priceSection}>
            <Text style={styles.price}>{quote.price.toFixed(2)}€</Text>
            <View style={[styles.changeBadge, { backgroundColor: isPositive ? COLORS.gain + '20' : COLORS.loss + '20' }]}>
              <Ionicons
                name={isPositive ? 'trending-up' : 'trending-down'}
                size={16}
                color={isPositive ? COLORS.gain : COLORS.loss}
              />
              <Text style={[styles.changeText, { color: isPositive ? COLORS.gain : COLORS.loss }]}>
                {isPositive ? '+' : ''}{quote.change.toFixed(2)}€ ({isPositive ? '+' : ''}{quote.changePercent.toFixed(2)}%)
              </Text>
            </View>
          </View>

          {/* Chart */}
          {history.length > 0 && (
            <View style={styles.chartSection}>
              <PriceChart data={history} positive={isPositive} />
            </View>
          )}

          {/* Stats */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Statistiques</Text>
            <View style={styles.statsGrid}>
              {[
                { label: 'Volume', value: `${(quote.volume / 1_000_000).toFixed(1)}M` },
                { label: 'PER', value: quote.pe ? quote.pe.toFixed(1) : 'N/A' },
                { label: 'Variation J', value: `${isPositive ? '+' : ''}${quote.changePercent.toFixed(2)}%` },
                { label: 'Prix actuel', value: `${quote.price.toFixed(2)}€` },
              ].map(stat => (
                <View key={stat.label} style={styles.statItem}>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                  <Text style={styles.statValue}>{stat.value}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* AI Analysis */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🤖 Analyse IA</Text>
            {analysis ? (
              <View style={styles.analysisCard}>
                <Text style={styles.analysisText}>{analysis}</Text>
              </View>
            ) : (
              <TouchableOpacity style={styles.analysisBtn} onPress={handleGetAnalysis} activeOpacity={0.8}>
                <LinearGradient
                  colors={[COLORS.primary + '30', COLORS.primary + '10']}
                  style={styles.analysisBtnGradient}
                >
                  {analysisLoading ? (
                    <>
                      <ActivityIndicator size="small" color={COLORS.primary} />
                      <Text style={styles.analysisBtnText}>Analyse en cours...</Text>
                    </>
                  ) : (
                    <>
                      <Ionicons name="flash" size={20} color={COLORS.primary} />
                      <Text style={styles.analysisBtnText}>Obtenir l'analyse IA</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>

          {/* News */}
          {news.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Actualités liées</Text>
              {news.map(article => (
                <View key={article.id} style={styles.newsCard}>
                  <Text style={styles.newsTitle} numberOfLines={2}>{article.title}</Text>
                  <Text style={styles.newsSource}>{article.source}</Text>
                </View>
              ))}
            </View>
          )}

          <View style={{ height: SPACING.xxxl }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  safeArea: { flex: 1 },
  loading: { flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center', gap: SPACING.md },
  loadingText: { color: COLORS.textSecondary },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.base, paddingVertical: SPACING.md },
  backBtn: { padding: SPACING.sm },
  headerTitle: { flex: 1, paddingHorizontal: SPACING.md },
  tickerText: { fontSize: FONTS.sizes.xl, fontWeight: FONTS.weights.extrabold, color: COLORS.text },
  nameText: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary },
  addBtn: { padding: SPACING.sm },
  priceSection: { paddingHorizontal: SPACING.base, paddingVertical: SPACING.md },
  price: { fontSize: FONTS.sizes.giant, fontWeight: FONTS.weights.extrabold, color: COLORS.text, marginBottom: SPACING.sm },
  changeBadge: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: RADIUS.full, alignSelf: 'flex-start' },
  changeText: { fontSize: FONTS.sizes.base, fontWeight: FONTS.weights.semibold },
  chartSection: { marginHorizontal: SPACING.base, marginBottom: SPACING.lg },
  section: { paddingHorizontal: SPACING.base, marginBottom: SPACING.xl },
  sectionTitle: { fontSize: FONTS.sizes.lg, fontWeight: FONTS.weights.bold, color: COLORS.text, marginBottom: SPACING.md },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  statItem: { flex: 1, minWidth: '45%', backgroundColor: COLORS.card, borderRadius: RADIUS.lg, padding: SPACING.md, borderWidth: 1, borderColor: COLORS.border },
  statLabel: { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary },
  statValue: { fontSize: FONTS.sizes.base, fontWeight: FONTS.weights.bold, color: COLORS.text, marginTop: 4 },
  analysisCard: { backgroundColor: COLORS.card, borderRadius: RADIUS.xl, padding: SPACING.base, borderWidth: 1, borderColor: COLORS.border },
  analysisText: { fontSize: FONTS.sizes.sm, color: COLORS.text, lineHeight: 20 },
  analysisBtn: { borderRadius: RADIUS.xl, overflow: 'hidden' },
  analysisBtnGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm, padding: SPACING.base, borderWidth: 1, borderColor: COLORS.primary + '30', borderRadius: RADIUS.xl },
  analysisBtnText: { fontSize: FONTS.sizes.base, fontWeight: FONTS.weights.semibold, color: COLORS.primary },
  newsCard: { backgroundColor: COLORS.card, borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.sm, borderWidth: 1, borderColor: COLORS.border },
  newsTitle: { fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.semibold, color: COLORS.text, marginBottom: 4 },
  newsSource: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted },
});
