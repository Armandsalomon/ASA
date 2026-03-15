import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, RefreshControl, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS, FONTS, SPACING, RADIUS } from '../constants/theme';
import { useApp } from '../context/AppContext';
import { getMultipleQuotes, searchStocks, StockQuote, DEFAULT_WATCHLIST, SECTORS } from '../services/marketService';
import { getMarketNews, NewsArticle } from '../services/newsService';
import { RootStackParamList } from '../navigation/AppNavigator';
import MiniChart from '../components/MiniChart';

type NavProp = NativeStackNavigationProp<RootStackParamList>;

const TABS = ['Watchlist', 'Secteurs', 'Actualités'];

export default function MarketScreen() {
  const navigation = useNavigation<NavProp>();
  const { alphaVantageKey } = useApp();
  const [activeTab, setActiveTab] = useState(0);
  const [stocks, setStocks] = useState<StockQuote[]>([]);
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<StockQuote[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [quotesData, newsData] = await Promise.all([
        getMultipleQuotes(DEFAULT_WATCHLIST, alphaVantageKey),
        getMarketNews(alphaVantageKey),
      ]);
      setStocks(quotesData);
      setNews(newsData);
    } catch (error) {
      console.error('Market load error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [alphaVantageKey]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length >= 1) {
      setIsSearching(true);
      const results = await searchStocks(query);
      setSearchResults(results);
      setIsSearching(false);
    } else {
      setSearchResults([]);
    }
  };

  const StockRow = ({ stock }: { stock: StockQuote }) => {
    const isPositive = stock.changePercent >= 0;
    return (
      <TouchableOpacity
        style={styles.stockRow}
        onPress={() => navigation.navigate('StockDetail', { ticker: stock.ticker })}
        activeOpacity={0.7}
      >
        <View style={styles.stockLeft}>
          <View style={[styles.tickerBadge, { backgroundColor: isPositive ? COLORS.gain + '15' : COLORS.loss + '15' }]}>
            <Text style={[styles.tickerText, { color: isPositive ? COLORS.gain : COLORS.loss }]}>
              {stock.ticker.slice(0, 4)}
            </Text>
          </View>
          <View style={styles.stockInfo}>
            <Text style={styles.stockName} numberOfLines={1}>{stock.name}</Text>
            <Text style={styles.stockVolume}>Vol: {(stock.volume / 1_000_000).toFixed(1)}M{stock.pe ? ` • PER: ${stock.pe}` : ''}</Text>
          </View>
        </View>
        <MiniChart data={[]} positive={isPositive} />
        <View style={styles.stockRight}>
          <Text style={styles.stockPrice}>{stock.price.toFixed(2)}</Text>
          <View style={[styles.changeBadge, { backgroundColor: isPositive ? COLORS.gain + '20' : COLORS.loss + '20' }]}>
            <Ionicons
              name={isPositive ? 'trending-up' : 'trending-down'}
              size={12}
              color={isPositive ? COLORS.gain : COLORS.loss}
            />
            <Text style={[styles.changeText, { color: isPositive ? COLORS.gain : COLORS.loss }]}>
              {isPositive ? '+' : ''}{stock.changePercent.toFixed(2)}%
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const SectorView = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      {Object.entries(SECTORS).map(([sector, tickers]) => {
        const sectorStocks = stocks.filter(s => tickers.includes(s.ticker));
        const avgChange = sectorStocks.length > 0
          ? sectorStocks.reduce((sum, s) => sum + s.changePercent, 0) / sectorStocks.length
          : 0;
        const sectorLabels: Record<string, { label: string; icon: string }> = {
          tech: { label: 'Technologie & IA', icon: '💻' },
          finance: { label: 'Finance & Banques', icon: '🏦' },
          energy: { label: 'Énergie', icon: '⚡' },
          luxury: { label: 'Luxe & Mode', icon: '💎' },
          etf: { label: 'ETF', icon: '📊' },
        };
        const { label, icon } = sectorLabels[sector] || { label: sector, icon: '📈' };
        return (
          <View key={sector} style={styles.sectorCard}>
            <View style={styles.sectorHeader}>
              <Text style={styles.sectorIcon}>{icon}</Text>
              <Text style={styles.sectorLabel}>{label}</Text>
              <View style={[styles.changeBadge, { backgroundColor: avgChange >= 0 ? COLORS.gain + '20' : COLORS.loss + '20' }]}>
                <Text style={[styles.changeText, { color: avgChange >= 0 ? COLORS.gain : COLORS.loss }]}>
                  {avgChange >= 0 ? '+' : ''}{avgChange.toFixed(2)}% moy.
                </Text>
              </View>
            </View>
            {sectorStocks.map(stock => <StockRow key={stock.ticker} stock={stock} />)}
          </View>
        );
      })}
    </ScrollView>
  );

  const NewsView = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      {news.map(article => (
        <View key={article.id} style={styles.newsCard}>
          <View style={styles.newsTop}>
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
                  color: article.sentiment === 'positive' ? COLORS.gain :
                    article.sentiment === 'negative' ? COLORS.loss : COLORS.warning
                }
              ]}>
                {article.sentiment === 'positive' ? '↑' :
                 article.sentiment === 'negative' ? '↓' : '→'} {article.category}
              </Text>
            </View>
            <Text style={styles.newsSource}>{article.source} • {new Date(article.publishedAt).toLocaleDateString('fr-FR')}</Text>
          </View>
          <Text style={styles.newsTitle}>{article.title}</Text>
          <Text style={styles.newsSummary} numberOfLines={3}>{article.summary}</Text>
          {article.tickers.length > 0 && (
            <View style={styles.tickersRow}>
              {article.tickers.slice(0, 4).map(ticker => (
                <TouchableOpacity
                  key={ticker}
                  style={styles.tickerTag}
                  onPress={() => navigation.navigate('StockDetail', { ticker })}
                >
                  <Text style={styles.tickerTagText}>{ticker}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      ))}
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.title}>Marchés</Text>
          <Text style={styles.date}>
            {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </Text>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={18} color={COLORS.textMuted} />
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={handleSearch}
              placeholder="Rechercher AAPL, Apple..."
              placeholderTextColor={COLORS.textMuted}
              autoCapitalize="characters"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => { setSearchQuery(''); setSearchResults([]); }}>
                <Ionicons name="close-circle" size={18} color={COLORS.textMuted} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Search Results */}
        {searchQuery.length > 0 && (
          <View style={styles.searchResults}>
            {isSearching ? (
              <ActivityIndicator color={COLORS.primary} />
            ) : searchResults.length > 0 ? (
              searchResults.map(stock => <StockRow key={stock.ticker} stock={stock} />)
            ) : (
              <Text style={styles.noResults}>Aucun résultat pour "{searchQuery}"</Text>
            )}
          </View>
        )}

        {/* Tabs */}
        {searchQuery.length === 0 && (
          <>
            <View style={styles.tabs}>
              {TABS.map((tab, i) => (
                <TouchableOpacity
                  key={tab}
                  style={[styles.tab, activeTab === i && styles.tabActive]}
                  onPress={() => setActiveTab(i)}
                >
                  <Text style={[styles.tabText, activeTab === i && styles.tabTextActive]}>{tab}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <ScrollView
              style={styles.content}
              showsVerticalScrollIndicator={false}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} tintColor={COLORS.primary} />}
            >
              {loading ? (
                <View style={styles.loadingCenter}>
                  <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
              ) : activeTab === 0 ? (
                stocks.map(stock => <StockRow key={stock.ticker} stock={stock} />)
              ) : activeTab === 1 ? (
                <SectorView />
              ) : (
                <NewsView />
              )}
              <View style={{ height: SPACING.xl }} />
            </ScrollView>
          </>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  safeArea: { flex: 1 },
  header: { paddingHorizontal: SPACING.base, paddingVertical: SPACING.md },
  title: { fontSize: FONTS.sizes.xxl, fontWeight: FONTS.weights.extrabold, color: COLORS.text },
  date: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, marginTop: 2, textTransform: 'capitalize' },
  searchContainer: { paddingHorizontal: SPACING.base, marginBottom: SPACING.md },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchInput: { flex: 1, color: COLORS.text, fontSize: FONTS.sizes.base },
  searchResults: { paddingHorizontal: SPACING.base },
  noResults: { color: COLORS.textSecondary, textAlign: 'center', padding: SPACING.xl },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.base,
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  tab: {
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.card,
  },
  tabActive: { backgroundColor: COLORS.primary },
  tabText: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, fontWeight: FONTS.weights.semibold },
  tabTextActive: { color: COLORS.background },
  content: { flex: 1, paddingHorizontal: SPACING.base },
  loadingCenter: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: SPACING.xxxl },
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
    width: 44, height: 44, borderRadius: RADIUS.md,
    justifyContent: 'center', alignItems: 'center',
  },
  tickerText: { fontSize: FONTS.sizes.xs, fontWeight: FONTS.weights.extrabold },
  stockInfo: { flex: 1 },
  stockName: { fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.semibold, color: COLORS.text, maxWidth: 110 },
  stockVolume: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted, marginTop: 1 },
  stockRight: { alignItems: 'flex-end', gap: 4 },
  stockPrice: { fontSize: FONTS.sizes.base, fontWeight: FONTS.weights.bold, color: COLORS.text },
  changeBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: SPACING.sm, paddingVertical: 2, borderRadius: RADIUS.sm },
  changeText: { fontSize: FONTS.sizes.xs, fontWeight: FONTS.weights.bold },
  sectorCard: { marginBottom: SPACING.lg },
  sectorHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.sm },
  sectorIcon: { fontSize: 20 },
  sectorLabel: { flex: 1, fontSize: FONTS.sizes.base, fontWeight: FONTS.weights.bold, color: COLORS.text },
  newsCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.base,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  newsTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm },
  sentimentBadge: { paddingHorizontal: SPACING.sm, paddingVertical: 2, borderRadius: RADIUS.sm },
  sentimentText: { fontSize: FONTS.sizes.xs, fontWeight: FONTS.weights.semibold },
  newsSource: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted },
  newsTitle: { fontSize: FONTS.sizes.base, fontWeight: FONTS.weights.bold, color: COLORS.text, marginBottom: SPACING.sm, lineHeight: 22 },
  newsSummary: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, lineHeight: 18 },
  tickersRow: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.sm, flexWrap: 'wrap' },
  tickerTag: { backgroundColor: COLORS.primary + '15', paddingHorizontal: SPACING.sm, paddingVertical: 2, borderRadius: RADIUS.sm },
  tickerTagText: { fontSize: FONTS.sizes.xs, color: COLORS.primary, fontWeight: FONTS.weights.bold },
});
