import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS, FONTS, SPACING, RADIUS } from '../constants/theme';
import { LESSONS } from '../constants/education';
import { useApp } from '../context/AppContext';
import { RootStackParamList } from '../navigation/AppNavigator';

type NavProp = NativeStackNavigationProp<RootStackParamList>;

const DIFFICULTY_CONFIG = {
  débutant: { color: COLORS.gain, icon: '🌱' },
  intermédiaire: { color: COLORS.warning, icon: '📈' },
  avancé: { color: COLORS.loss, icon: '🚀' },
};

export default function EducationScreen() {
  const navigation = useNavigation<NavProp>();
  const { userProfile } = useApp();
  const completedCount = userProfile.completedLessons.length;
  const totalCount = LESSONS.length;
  const progressPct = (completedCount / totalCount) * 100;

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.title}>Formation</Text>
          <Text style={styles.subtitle}>Devenez un investisseur éclairé</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Progress Card */}
          <View style={styles.section}>
            <LinearGradient
              colors={[COLORS.primary + '20', COLORS.primary + '08']}
              style={styles.progressCard}
            >
              <View style={styles.progressTop}>
                <View>
                  <Text style={styles.progressLabel}>Progression</Text>
                  <Text style={styles.progressValue}>{completedCount}/{totalCount} modules</Text>
                </View>
                <Text style={styles.progressPct}>{Math.round(progressPct)}%</Text>
              </View>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${progressPct}%` }]} />
              </View>
              {completedCount < totalCount && (
                <Text style={styles.progressMotivation}>
                  {completedCount === 0
                    ? '🎯 Commencez par les bases !'
                    : `🔥 Continuez ! Encore ${totalCount - completedCount} module${totalCount - completedCount > 1 ? 's' : ''} à compléter.`}
                </Text>
              )}
              {completedCount === totalCount && (
                <Text style={[styles.progressMotivation, { color: COLORS.gain }]}>
                  🏆 Félicitations ! Vous avez complété toute la formation !
                </Text>
              )}
            </LinearGradient>
          </View>

          {/* Quick Tips */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>💡 Le saviez-vous ?</Text>
            <View style={styles.tipCard}>
              <Text style={styles.tipText}>
                Warren Buffett a réalisé 99% de sa fortune après ses 50 ans. La clé ? La discipline, la patience et les intérêts composés.
              </Text>
            </View>
          </View>

          {/* Lessons */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Modules de Formation</Text>
            {LESSONS.map(lesson => {
              const isCompleted = userProfile.completedLessons.includes(lesson.id);
              const diffConfig = DIFFICULTY_CONFIG[lesson.difficulty];
              return (
                <TouchableOpacity
                  key={lesson.id}
                  style={[styles.lessonCard, isCompleted && styles.lessonCardCompleted]}
                  onPress={() => navigation.navigate('Lesson', { lessonId: lesson.id })}
                  activeOpacity={0.7}
                >
                  <View style={styles.lessonLeft}>
                    <View style={[styles.lessonIconContainer, { backgroundColor: isCompleted ? COLORS.gain + '20' : COLORS.cardElevated }]}>
                      {isCompleted ? (
                        <Ionicons name="checkmark-circle" size={24} color={COLORS.gain} />
                      ) : (
                        <Text style={styles.lessonIcon}>{lesson.icon}</Text>
                      )}
                    </View>
                    <View style={styles.lessonContent}>
                      <Text style={styles.lessonTitle}>{lesson.title}</Text>
                      <Text style={styles.lessonSubtitle}>{lesson.subtitle}</Text>
                      <View style={styles.lessonMeta}>
                        <View style={[styles.diffBadge, { backgroundColor: diffConfig.color + '20' }]}>
                          <Text style={[styles.diffText, { color: diffConfig.color }]}>
                            {diffConfig.icon} {lesson.difficulty}
                          </Text>
                        </View>
                        <Text style={styles.duration}>⏱ {lesson.duration}</Text>
                      </View>
                    </View>
                  </View>
                  <Ionicons
                    name={isCompleted ? 'checkmark-circle' : 'chevron-forward'}
                    size={20}
                    color={isCompleted ? COLORS.gain : COLORS.textMuted}
                  />
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Glossary Link */}
          <View style={styles.section}>
            <View style={styles.glossaryCard}>
              <Text style={styles.glossaryTitle}>📖 Glossaire Financier</Text>
              <Text style={styles.glossaryDesc}>
                RSI, MACD, PER, BPA, Free Cash Flow... Retrouvez tous les termes expliqués dans le Conseiller IA.
              </Text>
              <TouchableOpacity
                style={styles.glossaryBtn}
                onPress={() => navigation.navigate('Main', { screen: 'Advisor' } as any)}
              >
                <Text style={styles.glossaryBtnText}>Demander à ASA →</Text>
              </TouchableOpacity>
            </View>
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
  header: { paddingHorizontal: SPACING.base, paddingVertical: SPACING.md },
  title: { fontSize: FONTS.sizes.xxl, fontWeight: FONTS.weights.extrabold, color: COLORS.text },
  subtitle: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, marginTop: 2 },
  section: { paddingHorizontal: SPACING.base, marginBottom: SPACING.lg },
  sectionTitle: { fontSize: FONTS.sizes.lg, fontWeight: FONTS.weights.bold, color: COLORS.text, marginBottom: SPACING.md },
  progressCard: { borderRadius: RADIUS.xl, padding: SPACING.base, borderWidth: 1, borderColor: COLORS.primary + '30' },
  progressTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: SPACING.md },
  progressLabel: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary },
  progressValue: { fontSize: FONTS.sizes.xl, fontWeight: FONTS.weights.bold, color: COLORS.text },
  progressPct: { fontSize: FONTS.sizes.xxxl, fontWeight: FONTS.weights.extrabold, color: COLORS.primary },
  progressBar: { height: 8, backgroundColor: COLORS.border, borderRadius: RADIUS.full, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: COLORS.primary, borderRadius: RADIUS.full },
  progressMotivation: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, marginTop: SPACING.md },
  tipCard: { backgroundColor: COLORS.card, borderRadius: RADIUS.lg, padding: SPACING.md, borderLeftWidth: 3, borderLeftColor: COLORS.primary },
  tipText: { fontSize: FONTS.sizes.sm, color: COLORS.text, lineHeight: 20, fontStyle: 'italic' },
  lessonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  lessonCardCompleted: { borderColor: COLORS.gain + '40', backgroundColor: COLORS.gain + '08' },
  lessonLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  lessonIconContainer: { width: 48, height: 48, borderRadius: RADIUS.md, justifyContent: 'center', alignItems: 'center' },
  lessonIcon: { fontSize: 24 },
  lessonContent: { flex: 1 },
  lessonTitle: { fontSize: FONTS.sizes.base, fontWeight: FONTS.weights.bold, color: COLORS.text },
  lessonSubtitle: { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary, marginTop: 2 },
  lessonMeta: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginTop: SPACING.xs },
  diffBadge: { paddingHorizontal: SPACING.sm, paddingVertical: 2, borderRadius: RADIUS.sm },
  diffText: { fontSize: 10, fontWeight: FONTS.weights.semibold },
  duration: { fontSize: 10, color: COLORS.textMuted },
  glossaryCard: { backgroundColor: COLORS.card, borderRadius: RADIUS.xl, padding: SPACING.base, borderWidth: 1, borderColor: COLORS.border },
  glossaryTitle: { fontSize: FONTS.sizes.base, fontWeight: FONTS.weights.bold, color: COLORS.text, marginBottom: SPACING.sm },
  glossaryDesc: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, lineHeight: 20, marginBottom: SPACING.md },
  glossaryBtn: { backgroundColor: COLORS.primary + '20', borderRadius: RADIUS.lg, padding: SPACING.md, alignItems: 'center' },
  glossaryBtnText: { fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.semibold, color: COLORS.primary },
});
