import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Modal, TextInput, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import { useApp, PortfolioPosition } from '../context/AppContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type NavProp = NativeStackNavigationProp<RootStackParamList>;

export default function PortfolioScreen() {
  const { portfolio, addPosition, removePosition, userProfile } = useApp();
  const navigation = useNavigation<NavProp>();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTicker, setNewTicker] = useState('');
  const [newName, setNewName] = useState('');
  const [newShares, setNewShares] = useState('');
  const [newAvgPrice, setNewAvgPrice] = useState('');
  const [newCurrentPrice, setNewCurrentPrice] = useState('');

  const totalValue = portfolio.reduce((sum, p) => sum + p.shares * p.currentPrice, 0);
  const totalCost = portfolio.reduce((sum, p) => sum + p.shares * p.avgPrice, 0);
  const totalGain = totalValue - totalCost;
  const totalGainPct = totalCost > 0 ? (totalGain / totalCost) * 100 : 0;
  const isPositive = totalGain >= 0;

  const handleAddPosition = async () => {
    if (!newTicker || !newShares || !newAvgPrice || !newCurrentPrice) {
      Alert.alert('Champs manquants', 'Veuillez remplir tous les champs.');
      return;
    }
    const position: PortfolioPosition = {
      ticker: newTicker.toUpperCase(),
      name: newName || newTicker.toUpperCase(),
      shares: parseFloat(newShares),
      avgPrice: parseFloat(newAvgPrice),
      currentPrice: parseFloat(newCurrentPrice),
    };
    await addPosition(position);
    setShowAddModal(false);
    setNewTicker(''); setNewName(''); setNewShares(''); setNewAvgPrice(''); setNewCurrentPrice('');
  };

  const handleRemove = (ticker: string) => {
    Alert.alert(
      'Supprimer la position',
      `Voulez-vous supprimer ${ticker} de votre portefeuille ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Supprimer', style: 'destructive', onPress: () => removePosition(ticker) },
      ]
    );
  };

  const getRiskAdvice = () => {
    const advices = {
      conservative: 'Concentration max 5% par position • Favorisez les dividendes • Diversifiez sur 3-4 secteurs défensifs',
      moderate: 'Concentration max 10% par position • Mix croissance/valeur • Diversifiez sur 5-6 secteurs',
      aggressive: 'Conviction max 15% par position • Actions croissance • Acceptez la volatilité court terme',
    };
    return advices[userProfile.riskProfile];
  };

  if (portfolio.length === 0) {
    return (
      <View style={styles.container}>
        <SafeAreaView edges={['top']} style={styles.safeArea}>
          <View style={styles.header}>
            <Text style={styles.title}>Portefeuille</Text>
          </View>
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>💼</Text>
            <Text style={styles.emptyTitle}>Portefeuille vide</Text>
            <Text style={styles.emptyDesc}>
              Ajoutez vos positions pour suivre vos investissements et recevoir des analyses personnalisées.
            </Text>
            <TouchableOpacity style={styles.addFirstBtn} onPress={() => setShowAddModal(true)} activeOpacity={0.8}>
              <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.addFirstGradient}>
                <Ionicons name="add" size={20} color={COLORS.background} />
                <Text style={styles.addFirstText}>Ajouter une position</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
        <AddModal
          visible={showAddModal}
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddPosition}
          ticker={newTicker} setTicker={setNewTicker}
          name={newName} setName={setNewName}
          shares={newShares} setShares={setNewShares}
          avgPrice={newAvgPrice} setAvgPrice={setNewAvgPrice}
          currentPrice={newCurrentPrice} setCurrentPrice={setNewCurrentPrice}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.title}>Portefeuille</Text>
          <TouchableOpacity style={styles.addBtn} onPress={() => setShowAddModal(true)}>
            <Ionicons name="add" size={24} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Summary Card */}
          <View style={styles.section}>
            <LinearGradient
              colors={isPositive ? [COLORS.gain + '20', COLORS.gain + '08'] : [COLORS.loss + '20', COLORS.loss + '08']}
              style={styles.summaryCard}
            >
              <Text style={styles.summaryLabel}>Valeur totale</Text>
              <Text style={styles.summaryValue}>
                {totalValue.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€
              </Text>
              <View style={styles.gainRow}>
                <Ionicons
                  name={isPositive ? 'trending-up' : 'trending-down'}
                  size={18}
                  color={isPositive ? COLORS.gain : COLORS.loss}
                />
                <Text style={[styles.gainText, { color: isPositive ? COLORS.gain : COLORS.loss }]}>
                  {isPositive ? '+' : ''}{totalGain.toFixed(2)}€ ({isPositive ? '+' : ''}{totalGainPct.toFixed(2)}%)
                </Text>
              </View>
              <Text style={styles.costBasis}>Investi : {totalCost.toFixed(2)}€</Text>
            </LinearGradient>
          </View>

          {/* Risk Advice */}
          <View style={styles.section}>
            <View style={styles.adviceCard}>
              <Text style={styles.adviceIcon}>💡</Text>
              <View style={styles.adviceContent}>
                <Text style={styles.adviceTitle}>Conseil gestion du risque</Text>
                <Text style={styles.adviceText}>{getRiskAdvice()}</Text>
              </View>
            </View>
          </View>

          {/* Positions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Mes Positions ({portfolio.length})</Text>
            {portfolio.map(position => {
              const posValue = position.shares * position.currentPrice;
              const posGain = (position.currentPrice - position.avgPrice) * position.shares;
              const posGainPct = ((position.currentPrice - position.avgPrice) / position.avgPrice) * 100;
              const posWeight = totalValue > 0 ? (posValue / totalValue) * 100 : 0;
              const isPosPositive = posGain >= 0;

              return (
                <TouchableOpacity
                  key={position.ticker}
                  style={styles.positionCard}
                  onPress={() => navigation.navigate('StockDetail', { ticker: position.ticker })}
                  activeOpacity={0.7}
                >
                  <View style={styles.positionTop}>
                    <View style={[styles.tickerBadge, { backgroundColor: isPosPositive ? COLORS.gain + '15' : COLORS.loss + '15' }]}>
                      <Text style={[styles.tickerText, { color: isPosPositive ? COLORS.gain : COLORS.loss }]}>
                        {position.ticker.slice(0, 4)}
                      </Text>
                    </View>
                    <View style={styles.positionInfo}>
                      <Text style={styles.positionName} numberOfLines={1}>{position.name}</Text>
                      <Text style={styles.positionShares}>
                        {position.shares} action{position.shares > 1 ? 's' : ''} à {position.avgPrice.toFixed(2)}€ moy.
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleRemove(position.ticker)}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Ionicons name="trash-outline" size={16} color={COLORS.textMuted} />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.positionBottom}>
                    <View>
                      <Text style={styles.positionValue}>{posValue.toFixed(2)}€</Text>
                      <Text style={styles.positionWeight}>{posWeight.toFixed(1)}% du portefeuille</Text>
                    </View>
                    <View style={styles.positionGainContainer}>
                      <Text style={[styles.positionGain, { color: isPosPositive ? COLORS.gain : COLORS.loss }]}>
                        {isPosPositive ? '+' : ''}{posGain.toFixed(2)}€
                      </Text>
                      <View style={[styles.changeBadge, { backgroundColor: isPosPositive ? COLORS.gain + '20' : COLORS.loss + '20' }]}>
                        <Text style={[styles.changeText, { color: isPosPositive ? COLORS.gain : COLORS.loss }]}>
                          {isPosPositive ? '+' : ''}{posGainPct.toFixed(2)}%
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Weight bar */}
                  <View style={styles.weightBar}>
                    <View style={[
                      styles.weightFill,
                      {
                        width: `${Math.min(posWeight, 100)}%`,
                        backgroundColor: isPosPositive ? COLORS.gain : COLORS.loss,
                      }
                    ]} />
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
          <View style={{ height: SPACING.xl }} />
        </ScrollView>
      </SafeAreaView>

      <AddModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddPosition}
        ticker={newTicker} setTicker={setNewTicker}
        name={newName} setName={setNewName}
        shares={newShares} setShares={setNewShares}
        avgPrice={newAvgPrice} setAvgPrice={setNewAvgPrice}
        currentPrice={newCurrentPrice} setCurrentPrice={setNewCurrentPrice}
      />
    </View>
  );
}

interface AddModalProps {
  visible: boolean; onClose: () => void; onAdd: () => void;
  ticker: string; setTicker: (v: string) => void;
  name: string; setName: (v: string) => void;
  shares: string; setShares: (v: string) => void;
  avgPrice: string; setAvgPrice: (v: string) => void;
  currentPrice: string; setCurrentPrice: (v: string) => void;
}

function AddModal({ visible, onClose, onAdd, ticker, setTicker, name, setName, shares, setShares, avgPrice, setAvgPrice, currentPrice, setCurrentPrice }: AddModalProps) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={modalStyles.overlay}>
        <View style={modalStyles.sheet}>
          <View style={modalStyles.handle} />
          <Text style={modalStyles.title}>Ajouter une position</Text>
          {[
            { label: 'Ticker (ex: AAPL)', value: ticker, setter: setTicker, placeholder: 'AAPL', autoCapitalize: 'characters' },
            { label: 'Nom de l\'entreprise', value: name, setter: setName, placeholder: 'Apple Inc.' },
            { label: 'Nombre d\'actions', value: shares, setter: setShares, placeholder: '10', keyboardType: 'decimal-pad' },
            { label: 'Prix d\'achat moyen (€)', value: avgPrice, setter: setAvgPrice, placeholder: '150.00', keyboardType: 'decimal-pad' },
            { label: 'Prix actuel (€)', value: currentPrice, setter: setCurrentPrice, placeholder: '180.00', keyboardType: 'decimal-pad' },
          ].map(field => (
            <View key={field.label} style={modalStyles.field}>
              <Text style={modalStyles.fieldLabel}>{field.label}</Text>
              <TextInput
                style={modalStyles.fieldInput}
                value={field.value}
                onChangeText={field.setter}
                placeholder={field.placeholder}
                placeholderTextColor={COLORS.textMuted}
                keyboardType={(field.keyboardType as any) || 'default'}
                autoCapitalize={(field.autoCapitalize as any) || 'none'}
              />
            </View>
          ))}
          <TouchableOpacity onPress={onAdd} activeOpacity={0.8}>
            <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={modalStyles.addBtn}>
              <Text style={modalStyles.addBtnText}>Ajouter au portefeuille</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity style={modalStyles.cancelBtn} onPress={onClose}>
            <Text style={modalStyles.cancelText}>Annuler</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  safeArea: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SPACING.base, paddingVertical: SPACING.md },
  title: { fontSize: FONTS.sizes.xxl, fontWeight: FONTS.weights.extrabold, color: COLORS.text },
  addBtn: { padding: SPACING.sm, backgroundColor: COLORS.primary + '20', borderRadius: RADIUS.full },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.xl },
  emptyIcon: { fontSize: 64, marginBottom: SPACING.xl },
  emptyTitle: { fontSize: FONTS.sizes.xl, fontWeight: FONTS.weights.bold, color: COLORS.text, marginBottom: SPACING.md },
  emptyDesc: { fontSize: FONTS.sizes.base, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: SPACING.xl },
  addFirstBtn: { width: '100%', borderRadius: RADIUS.lg, overflow: 'hidden' },
  addFirstGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: SPACING.base, gap: SPACING.sm },
  addFirstText: { fontSize: FONTS.sizes.base, fontWeight: FONTS.weights.bold, color: COLORS.background },
  section: { paddingHorizontal: SPACING.base, marginBottom: SPACING.lg },
  sectionTitle: { fontSize: FONTS.sizes.lg, fontWeight: FONTS.weights.bold, color: COLORS.text, marginBottom: SPACING.md },
  summaryCard: { borderRadius: RADIUS.xl, padding: SPACING.xl, borderWidth: 1, borderColor: COLORS.border },
  summaryLabel: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary },
  summaryValue: { fontSize: FONTS.sizes.giant, fontWeight: FONTS.weights.extrabold, color: COLORS.text, marginVertical: SPACING.xs },
  gainRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  gainText: { fontSize: FONTS.sizes.base, fontWeight: FONTS.weights.semibold },
  costBasis: { fontSize: FONTS.sizes.sm, color: COLORS.textMuted, marginTop: SPACING.xs },
  adviceCard: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: COLORS.card, borderRadius: RADIUS.lg, padding: SPACING.md, gap: SPACING.md, borderWidth: 1, borderColor: COLORS.border },
  adviceIcon: { fontSize: 24 },
  adviceContent: { flex: 1 },
  adviceTitle: { fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.bold, color: COLORS.text, marginBottom: 4 },
  adviceText: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, lineHeight: 18 },
  positionCard: { backgroundColor: COLORS.card, borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.md, borderWidth: 1, borderColor: COLORS.border },
  positionTop: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.md },
  tickerBadge: { width: 44, height: 44, borderRadius: RADIUS.md, justifyContent: 'center', alignItems: 'center' },
  tickerText: { fontSize: FONTS.sizes.xs, fontWeight: FONTS.weights.extrabold },
  positionInfo: { flex: 1 },
  positionName: { fontSize: FONTS.sizes.base, fontWeight: FONTS.weights.semibold, color: COLORS.text },
  positionShares: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted },
  positionBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  positionValue: { fontSize: FONTS.sizes.lg, fontWeight: FONTS.weights.bold, color: COLORS.text },
  positionWeight: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted },
  positionGainContainer: { alignItems: 'flex-end', gap: 4 },
  positionGain: { fontSize: FONTS.sizes.base, fontWeight: FONTS.weights.semibold },
  changeBadge: { paddingHorizontal: SPACING.sm, paddingVertical: 2, borderRadius: RADIUS.sm },
  changeText: { fontSize: FONTS.sizes.xs, fontWeight: FONTS.weights.bold },
  weightBar: { height: 3, backgroundColor: COLORS.border, borderRadius: RADIUS.full, marginTop: SPACING.sm, overflow: 'hidden' },
  weightFill: { height: '100%', borderRadius: RADIUS.full },
});

const modalStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: '#000000AA', justifyContent: 'flex-end' },
  sheet: { backgroundColor: COLORS.surface, borderTopLeftRadius: RADIUS.xl, borderTopRightRadius: RADIUS.xl, padding: SPACING.xl, paddingBottom: SPACING.xxxl },
  handle: { width: 40, height: 4, backgroundColor: COLORS.border, borderRadius: RADIUS.full, alignSelf: 'center', marginBottom: SPACING.xl },
  title: { fontSize: FONTS.sizes.xl, fontWeight: FONTS.weights.bold, color: COLORS.text, marginBottom: SPACING.xl },
  field: { marginBottom: SPACING.md },
  fieldLabel: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, marginBottom: SPACING.xs },
  fieldInput: { backgroundColor: COLORS.card, borderRadius: RADIUS.lg, padding: SPACING.md, color: COLORS.text, fontSize: FONTS.sizes.base, borderWidth: 1, borderColor: COLORS.border },
  addBtn: { borderRadius: RADIUS.lg, padding: SPACING.base, alignItems: 'center', marginTop: SPACING.md },
  addBtnText: { fontSize: FONTS.sizes.base, fontWeight: FONTS.weights.bold, color: COLORS.background },
  cancelBtn: { alignItems: 'center', padding: SPACING.md, marginTop: SPACING.sm },
  cancelText: { fontSize: FONTS.sizes.base, color: COLORS.textSecondary },
});
