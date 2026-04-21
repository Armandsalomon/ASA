import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { COLORS, FONTS, SPACING, RADIUS } from '../constants/theme';
import { LESSONS, QuizQuestion } from '../constants/education';
import { useApp } from '../context/AppContext';
import { RootStackParamList } from '../navigation/AppNavigator';

type RouteType = RouteProp<RootStackParamList, 'Lesson'>;

export default function LessonScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteType>();
  const { lessonId } = route.params;
  const { markLessonComplete } = useApp();
  const lesson = LESSONS.find(l => l.id === lessonId);
  const [showQuiz, setShowQuiz] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [quizDone, setQuizDone] = useState(false);

  if (!lesson) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: COLORS.text }}>Module introuvable</Text>
      </View>
    );
  }

  const question: QuizQuestion = lesson.quiz[0];

  const handleAnswer = (index: number) => {
    setSelectedAnswer(index);
    if (index === question.answer) {
      markLessonComplete(lesson.id);
    }
    setTimeout(() => setQuizDone(true), 800);
  };

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <View style={styles.headerMeta}>
            <Text style={styles.lessonMeta}>{lesson.icon} {lesson.difficulty} • {lesson.duration}</Text>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          <Text style={styles.title}>{lesson.title}</Text>
          <Text style={styles.subtitle}>{lesson.subtitle}</Text>

          {/* Content Sections */}
          {!showQuiz ? (
            <>
              {lesson.content.map((section, i) => (
                <View key={i} style={styles.section}>
                  <Text style={styles.sectionTitle}>{section.title}</Text>
                  <Text style={styles.sectionText}>{section.text}</Text>
                  {section.tip && (
                    <View style={styles.tipBox}>
                      <Text style={styles.tipText}>{section.tip}</Text>
                    </View>
                  )}
                </View>
              ))}

              <TouchableOpacity onPress={() => setShowQuiz(true)} activeOpacity={0.8}>
                <LinearGradient
                  colors={[COLORS.primary, COLORS.primaryDark]}
                  style={styles.quizBtn}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                >
                  <Ionicons name="help-circle-outline" size={20} color={COLORS.background} />
                  <Text style={styles.quizBtnText}>Testez vos connaissances</Text>
                </LinearGradient>
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.quizContainer}>
              <Text style={styles.quizTitle}>📝 Quiz</Text>
              <Text style={styles.quizQuestion}>{question.question}</Text>
              <View style={styles.options}>
                {question.options.map((option, i) => {
                  let bg = COLORS.card;
                  let border = COLORS.border;
                  let textColor = COLORS.text;
                  if (selectedAnswer !== null) {
                    if (i === question.answer) { bg = COLORS.gain + '20'; border = COLORS.gain; textColor = COLORS.gain; }
                    else if (i === selectedAnswer && i !== question.answer) { bg = COLORS.loss + '20'; border = COLORS.loss; textColor = COLORS.loss; }
                  }
                  return (
                    <TouchableOpacity
                      key={i}
                      style={[styles.option, { backgroundColor: bg, borderColor: border }]}
                      onPress={() => !selectedAnswer && selectedAnswer !== 0 && handleAnswer(i)}
                      disabled={selectedAnswer !== null}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.optionText, { color: textColor }]}>{option}</Text>
                      {selectedAnswer !== null && i === question.answer && (
                        <Ionicons name="checkmark-circle" size={20} color={COLORS.gain} />
                      )}
                      {selectedAnswer !== null && i === selectedAnswer && i !== question.answer && (
                        <Ionicons name="close-circle" size={20} color={COLORS.loss} />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>

              {quizDone && (
                <View style={[
                  styles.explanationBox,
                  { backgroundColor: selectedAnswer === question.answer ? COLORS.gain + '15' : COLORS.info + '15' }
                ]}>
                  <Text style={[
                    styles.explanationTitle,
                    { color: selectedAnswer === question.answer ? COLORS.gain : COLORS.info }
                  ]}>
                    {selectedAnswer === question.answer ? '🎉 Correct !' : '💡 Explication'}
                  </Text>
                  <Text style={styles.explanationText}>{question.explanation}</Text>
                </View>
              )}

              {quizDone && (
                <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.8}>
                  <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.doneBtn}>
                    <Ionicons name="checkmark" size={20} color={COLORS.background} />
                    <Text style={styles.doneBtnText}>Terminer le module</Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
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
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.base, paddingVertical: SPACING.md },
  backBtn: { padding: SPACING.sm },
  headerMeta: { flex: 1, alignItems: 'center' },
  lessonMeta: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary },
  content: { padding: SPACING.base },
  title: { fontSize: FONTS.sizes.xxl, fontWeight: FONTS.weights.extrabold, color: COLORS.text, marginBottom: SPACING.xs },
  subtitle: { fontSize: FONTS.sizes.base, color: COLORS.primary, marginBottom: SPACING.xl },
  section: { marginBottom: SPACING.xl },
  sectionTitle: { fontSize: FONTS.sizes.lg, fontWeight: FONTS.weights.bold, color: COLORS.text, marginBottom: SPACING.md },
  sectionText: { fontSize: FONTS.sizes.base, color: COLORS.textSecondary, lineHeight: 24 },
  tipBox: { backgroundColor: COLORS.primary + '15', borderRadius: RADIUS.lg, padding: SPACING.md, marginTop: SPACING.md, borderLeftWidth: 3, borderLeftColor: COLORS.primary },
  tipText: { fontSize: FONTS.sizes.sm, color: COLORS.text, lineHeight: 20 },
  quizBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm, borderRadius: RADIUS.xl, padding: SPACING.base, marginTop: SPACING.lg },
  quizBtnText: { fontSize: FONTS.sizes.base, fontWeight: FONTS.weights.bold, color: COLORS.background },
  quizContainer: { gap: SPACING.md },
  quizTitle: { fontSize: FONTS.sizes.xl, fontWeight: FONTS.weights.bold, color: COLORS.text },
  quizQuestion: { fontSize: FONTS.sizes.lg, color: COLORS.text, lineHeight: 26, fontWeight: FONTS.weights.semibold },
  options: { gap: SPACING.sm },
  option: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: RADIUS.lg, padding: SPACING.base, borderWidth: 1.5 },
  optionText: { flex: 1, fontSize: FONTS.sizes.base, lineHeight: 20 },
  explanationBox: { borderRadius: RADIUS.xl, padding: SPACING.base },
  explanationTitle: { fontSize: FONTS.sizes.base, fontWeight: FONTS.weights.bold, marginBottom: SPACING.sm },
  explanationText: { fontSize: FONTS.sizes.sm, color: COLORS.text, lineHeight: 20 },
  doneBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm, borderRadius: RADIUS.xl, padding: SPACING.base, marginTop: SPACING.md },
  doneBtnText: { fontSize: FONTS.sizes.base, fontWeight: FONTS.weights.bold, color: COLORS.background },
});
