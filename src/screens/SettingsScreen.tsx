import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { COLORS, FONTS, SPACING, RADIUS } from '../constants/theme';
import { useApp } from '../context/AppContext';

const RISK_OPTIONS = [
  { value: 'conservative', label: 'Conservateur', desc: 'Préservation du capital', icon: '🛡️', color: COLORS.conservative },
  { value: 'moderate', label: 'Modéré', desc: 'Croissance équilibrée', icon: '⚖️', color: COLORS.moderate },
  { value: 'aggressive', label: 'Agressif', desc: 'Performance maximale', icon: '🚀', color: COLORS.aggressive },
] as const;

const HORIZON_OPTIONS = [
  { value: 'short', label: 'Court terme', desc: 'Moins d\'1 an' },
  { value: 'medium', label: 'Moyen terme', desc: '1 à 5 ans' },
  { value: 'long', label: 'Long terme', desc: 'Plus de 5 ans' },
] as const;

export default function SettingsScreen() {
  const navigation = useNavigation();
  const { userProfile, updateUserProfile, anthropicKey, alphaVantageKey, setAnthropicKey, setAlphaVantageKey } = useApp();
  const [anthropicInput, setAnthropicInput] = useState(anthropicKey || '');
  const [alphaInput, setAlphaInput] = useState(alphaVantageKey || '');
  const [capitalInput, setCapitalInput] = useState(userProfile.capital || '10000');
  const [showAnthropicKey, setShowAnthropicKey] = useState(false);
  const [showAlphaKey, setShowAlphaKey] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await Promise.all([
        anthropicInput !== anthropicKey ? setAnthropicKey(anthropicInput) : Promise.resolve(),
        alphaInput !== alphaVantageKey ? setAlphaVantageKey(alphaInput) : Promise.resolve(),
        updateUserProfile({ capital: capitalInput }),
      ]);
      Alert.alert('✅ Sauvegardé', 'Vos paramètres ont été enregistrés.');
    } catch {
      Alert.alert('Erreur', 'Impossible de sauvegarder les paramètres.');
    } finally {
      setSaving(false);
    }
  };

  const handleResetProfile = () => {
    Alert.alert(
      'Refaire le quiz de profil',
      'Cela va relancer le questionnaire de profil de risque.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Continuer',
          onPress: () => {
            navigation.navigate('RiskProfile' as never);
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="close" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Paramètres</Text>
          <TouchableOpacity onPress={handleSave} style={styles.saveBtn}>
            <Text style={styles.saveBtnText}>{saving ? '...' : 'Sauv.'}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* API Keys */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🔑 Clés API</Text>
            <View style={styles.card}>
              <Text style={styles.apiTitle}>Anthropic (Claude Opus)</Text>
              <Text style={styles.apiDesc}>Obligatoire pour le Conseiller IA. Obtenez votre clé sur console.anthropic.com</Text>
              <View style={styles.keyInput}>
                <TextInput
                  style={styles.keyField}
                  value={anthropicInput}
                  onChangeText={setAnthropicInput}
                  placeholder="sk-ant-..."
                  placeholderTextColor={COLORS.textMuted}
                  secureTextEntry={!showAnthropicKey}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity onPress={() => setShowAnthropicKey(!showAnthropicKey)}>
                  <Ionicons name={showAnthropicKey ? 'eye-off' : 'eye'} size={20} color={COLORS.textSecondary} />
                </TouchableOpacity>
              </View>
              {anthropicInput && (
                <View style={styles.keyStatus}>
                  <View style={[styles.statusDot, { backgroundColor: COLORS.gain }]} />
                  <Text style={[styles.statusText, { color: COLORS.gain }]}>Clé configurée</Text>
                </View>
              )}
            </View>

            <View style={[styles.card, { marginTop: SPACING.md }]}>
              <Text style={styles.apiTitle}>Alpha Vantage (Données de marché)</Text>
              <Text style={styles.apiDesc}>Optionnel. Clé gratuite sur alphavantage.co (500 req/jour)</Text>
              <View style={styles.keyInput}>
                <TextInput
                  style={styles.keyField}
                  value={alphaInput}
                  onChangeText={setAlphaInput}
                  placeholder="Votre clé Alpha Vantage"
                  placeholderTextColor={COLORS.textMuted}
                  secureTextEntry={!showAlphaKey}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity onPress={() => setShowAlphaKey(!showAlphaKey)}>
                  <Ionicons name={showAlphaKey ? 'eye-off' : 'eye'} size={20} color={COLORS.textSecondary} />
                </TouchableOpacity>
              </View>
              {!alphaInput && (
                <Text style={styles.demoNote}>Mode démo actif — données simulées</Text>
              )}
            </View>
          </View>

          {/* Profile Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>👤 Mon Profil</Text>
            <View style={styles.card}>
              <Text style={styles.fieldLabel}>Profil de risque</Text>
              <View style={styles.radioGroup}>
                {RISK_OPTIONS.map(option => (
                  <TouchableOpacity
                    key={option.value}
                    style={[styles.radioOption, userProfile.riskProfile === option.value && { borderColor: option.color, backgroundColor: option.color + '10' }]}
                    onPress={() => updateUserProfile({ riskProfile: option.value })}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.radioIcon}>{option.icon}</Text>
                    <View style={styles.radioContent}>
                      <Text style={[styles.radioLabel, userProfile.riskProfile === option.value && { color: option.color }]}>{option.label}</Text>
                      <Text style={styles.radioDesc}>{option.desc}</Text>
                    </View>
                    {userProfile.riskProfile === option.value && (
                      <Ionicons name="checkmark-circle" size={20} color={option.color} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={[styles.card, { marginTop: SPACING.md }]}>
              <Text style={styles.fieldLabel}>Horizon d'investissement</Text>
              <View style={styles.radioGroup}>
                {HORIZON_OPTIONS.map(option => (
                  <TouchableOpacity
                    key={option.value}
                    style={[styles.radioOption, userProfile.horizon === option.value && { borderColor: COLORS.primary, backgroundColor: COLORS.primary + '10' }]}
                    onPress={() => updateUserProfile({ horizon: option.value })}
                    activeOpacity={0.7}
                  >
                    <View style={styles.radioContent}>
                      <Text style={[styles.radioLabel, userProfile.horizon === option.value && { color: COLORS.primary }]}>{option.label}</Text>
                      <Text style={styles.radioDesc}>{option.desc}</Text>
                    </View>
                    {userProfile.horizon === option.value && (
                      <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={[styles.card, { marginTop: SPACING.md }]}>
              <Text style={styles.fieldLabel}>Capital disponible (€)</Text>
              <TextInput
                style={styles.capitalInput}
                value={capitalInput}
                onChangeText={setCapitalInput}
                keyboardType="decimal-pad"
                placeholder="10000"
                placeholderTextColor={COLORS.textMuted}
              />
            </View>
          </View>

          {/* Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⚙️ Actions</Text>
            <TouchableOpacity style={styles.actionBtn} onPress={handleResetProfile} activeOpacity={0.7}>
              <Ionicons name="refresh" size={20} color={COLORS.info} />
              <Text style={[styles.actionText, { color: COLORS.info }]}>Refaire le quiz de profil</Text>
              <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Security Note */}
          <View style={styles.section}>
            <View style={styles.securityNote}>
              <Ionicons name="shield-checkmark" size={20} color={COLORS.gain} />
              <Text style={styles.securityText}>
                Vos clés API sont stockées de manière chiffrée sur votre appareil uniquement (Expo SecureStore). Elles ne sont jamais transmises à nos serveurs.
              </Text>
            </View>
          </View>

          {/* Save Button */}
          <View style={styles.section}>
            <TouchableOpacity onPress={handleSave} disabled={saving} activeOpacity={0.8}>
              <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.saveFullBtn}>
                <Text style={styles.saveFullText}>{saving ? 'Sauvegarde...' : 'Sauvegarder les paramètres'}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* App Info */}
          <View style={styles.appInfo}>
            <Text style={styles.appInfoText}>ASA - Advisor Stock App v1.0.0</Text>
            <Text style={styles.appInfoText}>Propulsé par Claude Opus 4.6 (Anthropic)</Text>
            <Text style={styles.appInfoText}>⚠️ Outil informatif uniquement • Pas de conseil financier réglementé</Text>
          </View>

          <View style={{ height: SPACING.xxxl }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  safeArea: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.base, paddingVertical: SPACING.md },
  backBtn: { padding: SPACING.sm },
  title: { fontSize: FONTS.sizes.xl, fontWeight: FONTS.weights.bold, color: COLORS.text },
  saveBtn: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, backgroundColor: COLORS.primary + '20', borderRadius: RADIUS.full },
  saveBtnText: { fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.bold, color: COLORS.primary },
  section: { paddingHorizontal: SPACING.base, marginBottom: SPACING.xl },
  sectionTitle: { fontSize: FONTS.sizes.lg, fontWeight: FONTS.weights.bold, color: COLORS.text, marginBottom: SPACING.md },
  card: { backgroundColor: COLORS.card, borderRadius: RADIUS.xl, padding: SPACING.base, borderWidth: 1, borderColor: COLORS.border },
  apiTitle: { fontSize: FONTS.sizes.base, fontWeight: FONTS.weights.bold, color: COLORS.text, marginBottom: SPACING.xs },
  apiDesc: { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary, marginBottom: SPACING.md, lineHeight: 16 },
  keyInput: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.background, borderRadius: RADIUS.lg, paddingHorizontal: SPACING.md, borderWidth: 1, borderColor: COLORS.border },
  keyField: { flex: 1, color: COLORS.text, fontSize: FONTS.sizes.sm, paddingVertical: SPACING.md },
  keyStatus: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, marginTop: SPACING.sm },
  statusDot: { width: 6, height: 6, borderRadius: RADIUS.full },
  statusText: { fontSize: FONTS.sizes.xs, fontWeight: FONTS.weights.semibold },
  demoNote: { fontSize: FONTS.sizes.xs, color: COLORS.warning, marginTop: SPACING.sm },
  fieldLabel: { fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.semibold, color: COLORS.textSecondary, marginBottom: SPACING.md },
  radioGroup: { gap: SPACING.sm },
  radioOption: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, backgroundColor: COLORS.background, borderRadius: RADIUS.lg, padding: SPACING.md, borderWidth: 1, borderColor: COLORS.border },
  radioIcon: { fontSize: 20 },
  radioContent: { flex: 1 },
  radioLabel: { fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.semibold, color: COLORS.text },
  radioDesc: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted },
  capitalInput: { backgroundColor: COLORS.background, borderRadius: RADIUS.lg, padding: SPACING.md, color: COLORS.text, fontSize: FONTS.sizes.base, borderWidth: 1, borderColor: COLORS.border },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, backgroundColor: COLORS.card, borderRadius: RADIUS.lg, padding: SPACING.base, borderWidth: 1, borderColor: COLORS.border },
  actionText: { flex: 1, fontSize: FONTS.sizes.base, fontWeight: FONTS.weights.medium },
  securityNote: { flexDirection: 'row', gap: SPACING.sm, backgroundColor: COLORS.gain + '10', borderRadius: RADIUS.lg, padding: SPACING.md, borderWidth: 1, borderColor: COLORS.gain + '30' },
  securityText: { flex: 1, fontSize: FONTS.sizes.xs, color: COLORS.textSecondary, lineHeight: 16 },
  saveFullBtn: { borderRadius: RADIUS.lg, padding: SPACING.base, alignItems: 'center' },
  saveFullText: { fontSize: FONTS.sizes.base, fontWeight: FONTS.weights.bold, color: COLORS.background },
  appInfo: { alignItems: 'center', gap: 4, paddingBottom: SPACING.xl },
  appInfoText: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted, textAlign: 'center' },
});
