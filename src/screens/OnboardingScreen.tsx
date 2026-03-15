import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, Dimensions, FlatList,
  TouchableOpacity, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, RADIUS } from '../constants/theme';
import { RootStackParamList } from '../navigation/AppNavigator';

const { width } = Dimensions.get('window');

interface Slide {
  id: string;
  icon: string;
  title: string;
  subtitle: string;
  description: string;
  color: string;
}

const SLIDES: Slide[] = [
  {
    id: '1',
    icon: '🤖',
    title: 'Votre Conseiller IA',
    subtitle: 'Propulsé par Claude Opus',
    description: 'ASA analyse les marchés financiers en temps réel et vous donne des recommandations personnalisées basées sur votre profil de risque et les dernières actualités géopolitiques.',
    color: COLORS.primary,
  },
  {
    id: '2',
    icon: '📊',
    title: 'Analyses Approfondies',
    subtitle: 'Technique + Fondamentale',
    description: 'RSI, MACD, PER, macroéconomie... ASA combine toutes les dimensions de l\'analyse pour vous donner des signaux clairs : Acheter, Vendre ou Conserver, avec un niveau de confiance.',
    color: COLORS.info,
  },
  {
    id: '3',
    icon: '🛡️',
    title: 'Adapté à Votre Profil',
    subtitle: 'Conservateur • Modéré • Agressif',
    description: 'ASA adapte ses recommandations à votre tolérance au risque. Il n\'hésitera pas à vous déconseiller un investissement s\'il ne correspond pas à votre profil.',
    color: COLORS.warning,
  },
  {
    id: '4',
    icon: '📚',
    title: 'Apprenez en Investissant',
    subtitle: 'Formation intégrée',
    description: 'Chaque recommandation est accompagnée d\'explications pédagogiques. Devenez progressivement un investisseur autonome et éclairé grâce à nos 8 modules de formation.',
    color: '#B96EFF',
  },
];

type NavProp = NativeStackNavigationProp<RootStackParamList, 'Onboarding'>;

export default function OnboardingScreen() {
  const navigation = useNavigation<NavProp>();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
      setCurrentIndex(currentIndex + 1);
    } else {
      navigation.navigate('RiskProfile');
    }
  };

  const renderSlide = ({ item }: { item: Slide }) => (
    <View style={[styles.slide, { width }]}>
      <View style={[styles.iconContainer, { backgroundColor: item.color + '22' }]}>
        <Text style={styles.icon}>{item.icon}</Text>
      </View>
      <Text style={styles.slideTitle}>{item.title}</Text>
      <Text style={[styles.slideSubtitle, { color: item.color }]}>{item.subtitle}</Text>
      <Text style={styles.slideDescription}>{item.description}</Text>
    </View>
  );

  const renderDot = (index: number) => (
    <View
      key={index}
      style={[
        styles.dot,
        currentIndex === index && styles.dotActive,
        currentIndex === index && { backgroundColor: SLIDES[index].color },
      ]}
    />
  );

  return (
    <LinearGradient colors={[COLORS.background, '#0D1B2E']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>ASA</Text>
          <Text style={styles.logoSub}>Advisor Stock App</Text>
        </View>

        {/* Slides */}
        <FlatList
          ref={flatListRef}
          data={SLIDES}
          renderItem={renderSlide}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={item => item.id}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: false }
          )}
          onMomentumScrollEnd={e => {
            setCurrentIndex(Math.round(e.nativeEvent.contentOffset.x / width));
          }}
        />

        {/* Bottom */}
        <View style={styles.bottom}>
          <View style={styles.dots}>
            {SLIDES.map((_, i) => renderDot(i))}
          </View>

          <TouchableOpacity style={styles.nextButton} onPress={handleNext} activeOpacity={0.8}>
            <LinearGradient
              colors={[COLORS.primary, COLORS.primaryDark]}
              style={styles.nextGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.nextText}>
                {currentIndex === SLIDES.length - 1 ? 'Commencer' : 'Suivant'}
              </Text>
              <Ionicons name="arrow-forward" size={20} color={COLORS.background} />
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('RiskProfile')}>
            <Text style={styles.skipText}>Passer l'introduction</Text>
          </TouchableOpacity>
        </View>

        {/* Disclaimer */}
        <Text style={styles.disclaimer}>
          ⚠️ ASA est un outil informatif, pas un conseiller financier réglementé.
        </Text>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  header: { alignItems: 'center', paddingTop: SPACING.xl },
  logo: {
    fontSize: FONTS.sizes.giant,
    fontWeight: FONTS.weights.extrabold,
    color: COLORS.primary,
    letterSpacing: 4,
  },
  logoSub: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  slide: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: SPACING.xxl,
    paddingTop: SPACING.xxl,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: RADIUS.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xxl,
    marginTop: SPACING.xl,
  },
  icon: { fontSize: 56 },
  slideTitle: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: FONTS.weights.bold,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  slideSubtitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.semibold,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  slideDescription: {
    fontSize: FONTS.sizes.base,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  bottom: { paddingHorizontal: SPACING.xl, paddingBottom: SPACING.lg },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: SPACING.xl,
    gap: SPACING.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.textMuted,
  },
  dotActive: { width: 24 },
  nextButton: { borderRadius: RADIUS.lg, overflow: 'hidden', marginBottom: SPACING.lg },
  nextGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.base,
    gap: SPACING.sm,
  },
  nextText: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.bold,
    color: COLORS.background,
  },
  skipText: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sizes.sm,
    textAlign: 'center',
  },
  disclaimer: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textMuted,
    textAlign: 'center',
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.base,
  },
});
