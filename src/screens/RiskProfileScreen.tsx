import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Dimensions, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS, FONTS, SPACING, RADIUS } from '../constants/theme';
import { useApp, RiskProfile, InvestmentHorizon } from '../context/AppContext';
import { RootStackParamList } from '../navigation/AppNavigator';

type NavProp = NativeStackNavigationProp<RootStackParamList, 'RiskProfile'>;

interface Question {
  id: string;
  text: string;
  options: { label: string; value: string; score: number; description: string }[];
}

const QUESTIONS: Question[] = [
  {
    id: 'q1',
    text: 'Combien de temps pouvez-vous laisser votre argent investi ?',
    options: [
      { label: 'Moins d\'1 an', value: 'short', score: 1, description: 'Liquidité prioritaire' },
      { label: '1 à 5 ans', value: 'medium', score: 2, description: 'Horizon moyen terme' },
      { label: 'Plus de 5 ans', value: 'long', score: 3, description: 'Visée long terme' },
    ],
  },
  {
    id: 'q2',
    text: 'Si votre portefeuille perd 20% en 3 mois, vous :',
    options: [
      { label: 'Vendez tout', value: 'sell', score: 1, description: 'Préservation du capital' },
      { label: 'Maintenez vos positions', value: 'hold', score: 2, description: 'Patience et discipline' },
      { label: 'Achetez davantage', value: 'buy', score: 3, description: 'Opportunité d\'achat' },
    ],
  },
  {
    id: 'q3',
    text: 'Votre objectif principal est :',
    options: [
      { label: 'Protéger mon capital', value: 'protect', score: 1, description: '-5% maximum acceptable' },
      { label: 'Croissance régulière', value: 'grow', score: 2, description: 'Rendement/Risque équilibré' },
      { label: 'Maximum de gains', value: 'max', score: 3, description: 'Accepte la forte volatilité' },
    ],
  },
  {
    id: 'q4',
    text: 'Quelle part de vos économies souhaitez-vous investir en Bourse ?',
    options: [
      { label: 'Moins de 20%', value: 'low', score: 1, description: 'Très prudent' },
      { label: '20% à 50%', value: 'medium', score: 2, description: 'Équilibré' },
      { label: 'Plus de 50%', value: 'high', score: 3, description: 'Conviction forte' },
    ],
  },
  {
    id: 'q5',
    text: 'Votre expérience en investissement est :',
    options: [
      { label: 'Aucune / Débutant', value: 'none', score: 1, description: 'Je commence' },
      { label: 'Quelques années', value: 'some', score: 2, description: 'J\'ai des bases' },
      { label: 'Investisseur expérimenté', value: 'expert', score: 3, description: 'Je maîtrise les marchés' },
    ],
  },
];

const RISK_PROFILES: Record<string, { profile: RiskProfile; label: string; description: string; color: string; icon: string; strategy: string[] }> = {
  conservative: {
    profile: 'conservative',
    label: 'Conservateur',
    description: 'Vous préférez la sécurité à la performance. Votre priorité est de préserver votre capital avec des rendements stables et modérés.',
    color: COLORS.conservative,
    icon: '🛡️',
    strategy: ['ETF obligataires', 'Dividendes stables', 'Actions défensives', 'Portefeuille 60% obligations / 40% actions'],
  },
  moderate: {
    profile: 'moderate',
    label: 'Modéré',
    description: 'Vous cherchez un équilibre entre croissance et sécurité. Vous acceptez une volatilité limitée pour un rendement supérieur au long terme.',
    color: COLORS.moderate,
    icon: '⚖️',
    strategy: ['ETF diversifiés', 'Grandes capitalisations', 'Mix croissance/valeur', 'Portefeuille 60% actions / 40% obligations'],
  },
  aggressive: {
    profile: 'aggressive',
    label: 'Agressif',
    description: 'Vous recherchez la performance maximale et acceptez une forte volatilité. Vous avez un horizon long terme et une bonne connaissance des marchés.',
    color: COLORS.aggressive,
    icon: '🚀',
    strategy: ['Actions croissance', 'Secteur tech/IA', 'Petites capitalisations', 'Portefeuille 90% actions / 10% liquidités'],
  },
};

export default function RiskProfileScreen() {
  const navigation = useNavigation<NavProp>();
  const { updateUserProfile } = useApp();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showResult, setShowResult] = useState(false);
  const [horizon, setHorizon] = useState<InvestmentHorizon>('medium');

  const handleAnswer = (questionId: string, score: number, value: string) => {
    const newAnswers = { ...answers, [questionId]: score };
    setAnswers(newAnswers);
    if (questionId === 'q1') {
      setHorizon(value as InvestmentHorizon);
    }
    if (currentQuestion < QUESTIONS.length - 1) {
      setTimeout(() => setCurrentQuestion(currentQuestion + 1), 400);
    } else {
      setTimeout(() => setShowResult(true), 400);
    }
  };

  const getProfile = (): typeof RISK_PROFILES[string] => {
    const total = Object.values(answers).reduce((a, b) => a + b, 0);
    const avg = total / QUESTIONS.length;
    if (avg <= 1.6) return RISK_PROFILES.conservative;
    if (avg <= 2.4) return RISK_PROFILES.moderate;
    return RISK_PROFILES.aggressive;
  };

  const handleConfirm = async () => {
    const profile = getProfile();
    await updateUserProfile({
      riskProfile: profile.profile,
      horizon,
      hasCompletedOnboarding: true,
    });
    navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
  };

  if (showResult) {
    const profile = getProfile();
    return (
      <LinearGradient colors={[COLORS.background, '#0D1B2E']} style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <ScrollView contentContainerStyle={styles.resultContent}>
            <Text style={styles.resultHeader}>Votre Profil d'Investisseur</Text>
            <View style={[styles.profileCard, { borderColor: profile.color }]}>
              <Text style={styles.profileIcon}>{profile.icon}</Text>
              <Text style={[styles.profileLabel, { color: profile.color }]}>{profile.label}</Text>
              <Text style={styles.profileDescription}>{profile.description}</Text>
            </View>
            <View style={styles.strategyCard}>
              <Text style={styles.strategyTitle}>Stratégie recommandée pour vous</Text>
              {profile.strategy.map((s, i) => (
                <View key={i} style={styles.strategyItem}>
                  <View style={[styles.strategyDot, { backgroundColor: profile.color }]} />
                  <Text style={styles.strategyText}>{s}</Text>
                </View>
              ))}
            </View>
            <View style={styles.reassurance}>
              <Ionicons name="information-circle" size={20} color={COLORS.info} />
              <Text style={styles.reassuranceText}>
                Vous pourrez modifier votre profil à tout moment dans les paramètres.
                ASA adaptera toutes ses recommandations à votre profil.
              </Text>
            </View>
            <TouchableOpacity onPress={handleConfirm} activeOpacity={0.8}>
              <LinearGradient
                colors={[profile.color, profile.color + 'CC']}
                style={styles.confirmButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.confirmText}>Commencer avec ASA</Text>
                <Ionicons name="arrow-forward" size={20} color={COLORS.background} />
              </LinearGradient>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  const question = QUESTIONS[currentQuestion];
  const progress = (currentQuestion / QUESTIONS.length) * 100;

  return (
    <LinearGradient colors={[COLORS.background, '#0D1B2E']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          {currentQuestion > 0 && (
            <TouchableOpacity onPress={() => setCurrentQuestion(currentQuestion - 1)}>
              <Ionicons name="arrow-back" size={24} color={COLORS.textSecondary} />
            </TouchableOpacity>
          )}
          <Text style={styles.headerTitle}>Votre Profil</Text>
          <Text style={styles.headerProgress}>{currentQuestion + 1}/{QUESTIONS.length}</Text>
        </View>

        {/* Progress bar */}
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>

        <View style={styles.content}>
          <Text style={styles.questionText}>{question.text}</Text>
          <View style={styles.options}>
            {question.options.map(option => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.optionCard,
                  answers[question.id] === option.score && styles.optionSelected,
                ]}
                onPress={() => handleAnswer(question.id, option.score, option.value)}
                activeOpacity={0.7}
              >
                <View style={styles.optionContent}>
                  <Text style={styles.optionLabel}>{option.label}</Text>
                  <Text style={styles.optionDescription}>{option.description}</Text>
                </View>
                {answers[question.id] === option.score && (
                  <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.md,
  },
  headerTitle: { fontSize: FONTS.sizes.lg, fontWeight: FONTS.weights.bold, color: COLORS.text },
  headerProgress: { fontSize: FONTS.sizes.md, color: COLORS.textSecondary },
  progressBar: { height: 4, backgroundColor: COLORS.border, marginHorizontal: SPACING.base },
  progressFill: { height: '100%', backgroundColor: COLORS.primary, borderRadius: RADIUS.full },
  content: { flex: 1, paddingHorizontal: SPACING.base, paddingTop: SPACING.xxl },
  questionText: {
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.bold,
    color: COLORS.text,
    marginBottom: SPACING.xl,
    lineHeight: 30,
  },
  options: { gap: SPACING.md },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.base,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  optionSelected: { borderColor: COLORS.primary, backgroundColor: COLORS.primary + '15' },
  optionContent: { flex: 1 },
  optionLabel: { fontSize: FONTS.sizes.base, fontWeight: FONTS.weights.semibold, color: COLORS.text },
  optionDescription: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, marginTop: 2 },
  // Result styles
  resultContent: { padding: SPACING.base, paddingBottom: SPACING.xxxl },
  resultHeader: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: FONTS.weights.bold,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    marginTop: SPACING.lg,
  },
  profileCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    borderWidth: 2,
    marginBottom: SPACING.lg,
  },
  profileIcon: { fontSize: 56, marginBottom: SPACING.md },
  profileLabel: { fontSize: FONTS.sizes.xxl, fontWeight: FONTS.weights.extrabold, marginBottom: SPACING.md },
  profileDescription: { fontSize: FONTS.sizes.base, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 22 },
  strategyCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.base,
    marginBottom: SPACING.lg,
  },
  strategyTitle: { fontSize: FONTS.sizes.base, fontWeight: FONTS.weights.semibold, color: COLORS.text, marginBottom: SPACING.md },
  strategyItem: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.sm },
  strategyDot: { width: 8, height: 8, borderRadius: RADIUS.full },
  strategyText: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary },
  reassurance: {
    flexDirection: 'row',
    gap: SPACING.sm,
    backgroundColor: COLORS.info + '15',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.xl,
  },
  reassuranceText: { flex: 1, fontSize: FONTS.sizes.sm, color: COLORS.info, lineHeight: 18 },
  confirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.lg,
    padding: SPACING.base,
    gap: SPACING.sm,
  },
  confirmText: { fontSize: FONTS.sizes.lg, fontWeight: FONTS.weights.bold, color: COLORS.background },
});
