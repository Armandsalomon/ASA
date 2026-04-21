import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, KeyboardAvoidingView, Platform,
  ActivityIndicator, Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { COLORS, FONTS, SPACING, RADIUS } from '../constants/theme';
import { useApp, ChatMessage } from '../context/AppContext';
import { askAdvisor } from '../services/claudeService';

const QUICK_PROMPTS = [
  { label: '📊 Analyse NVIDIA', prompt: 'Analyse NVIDIA (NVDA) pour moi. Dois-je acheter, vendre ou conserver ?' },
  { label: '🌍 Macro actuelle', prompt: 'Quelle est la situation macro-économique actuelle et comment positionner mon portefeuille ?' },
  { label: '🛡️ Stratégie risque', prompt: 'Quelle stratégie recommandes-tu pour mon profil de risque en ce moment ?' },
  { label: '📚 Explique le RSI', prompt: 'Explique-moi le RSI (Relative Strength Index) et comment l\'utiliser en pratique.' },
  { label: '💰 Commencer DCA', prompt: 'Je veux commencer un investissement mensuel régulier (DCA). Sur quels actifs me conseilles-tu ?' },
  { label: '⚠️ Éviter les erreurs', prompt: 'Quelles sont les erreurs les plus courantes des investisseurs débutants que je dois absolument éviter ?' },
];

const WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content: `**Bonjour ! Je suis ASA, votre conseiller financier IA.** 🤖

Je suis propulsé par Claude Opus, le modèle d'IA le plus avancé d'Anthropic, et j'ai été entraîné pour analyser les marchés financiers comme un trader professionnel.

**Ce que je peux faire pour vous :**
• 📊 Analyser n'importe quelle action (buy/sell/hold avec niveau de confiance)
• 🌍 Décrypter les actualités géopolitiques et macro-économiques
• 🛡️ Vous proposer des stratégies adaptées à votre profil de risque
• 📚 Vous enseigner les concepts du trading et de l'investissement
• ⚠️ Vous déconseiller les mauvais investissements avec des données

**Comment commencer ?**
Utilisez les suggestions ci-dessous ou posez-moi directement vos questions.

*Note : Configurez votre clé API Anthropic dans les ⚙️ Paramètres pour activer les analyses IA.*`,
  timestamp: new Date(),
};

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';
  return (
    <View style={[styles.messageRow, isUser && styles.messageRowUser]}>
      {!isUser && (
        <View style={styles.avatarContainer}>
          <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.avatar}>
            <Text style={styles.avatarText}>A</Text>
          </LinearGradient>
        </View>
      )}
      <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAssistant]}>
        <FormattedText text={message.content} isUser={isUser} />
        <Text style={styles.timestamp}>
          {new Date(message.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    </View>
  );
}

function FormattedText({ text, isUser }: { text: string; isUser: boolean }) {
  // Basic markdown-like rendering
  const parts = text.split(/(\*\*[^*]+\*\*|__[^_]+__|\*[^*]+\*)/);
  return (
    <Text style={[styles.messageText, isUser && styles.messageTextUser]}>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <Text key={i} style={[styles.messageBold, isUser && { color: COLORS.background }]}>{part.slice(2, -2)}</Text>;
        }
        return <Text key={i}>{part}</Text>;
      })}
    </Text>
  );
}

export default function AdvisorScreen() {
  const { userProfile, portfolio, chatHistory, addChatMessage, clearChatHistory, anthropicKey } = useApp();
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput>(null);

  const allMessages = chatHistory.length === 0
    ? [WELCOME_MESSAGE]
    : [WELCOME_MESSAGE, ...chatHistory];

  useEffect(() => {
    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
  }, [chatHistory, streamingText]);

  const handleSend = async (text?: string) => {
    const message = text || inputText.trim();
    if (!message || isLoading) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Keyboard.dismiss();

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: new Date(),
    };

    addChatMessage(userMsg);
    setInputText('');
    setIsLoading(true);
    setStreamingText('');

    const historyForAPI = chatHistory.map(m => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));

    let fullResponse = '';

    await askAdvisor(
      message,
      historyForAPI,
      userProfile.riskProfile,
      userProfile.horizon,
      userProfile.capital,
      portfolio,
      anthropicKey,
      (chunk) => {
        if (chunk.type === 'text' && chunk.content) {
          fullResponse += chunk.content;
          setStreamingText(fullResponse);
        } else if (chunk.type === 'error') {
          fullResponse = `❌ **Erreur** : ${chunk.error}\n\nVérifiez votre clé API dans les ⚙️ Paramètres.`;
          setStreamingText(fullResponse);
        } else if (chunk.type === 'done') {
          const assistantMsg: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: fullResponse,
            timestamp: new Date(),
          };
          addChatMessage(assistantMsg);
          setStreamingText('');
          setIsLoading(false);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      },
    );
  };

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.headerAvatar}>
              <Text style={styles.headerAvatarText}>A</Text>
            </LinearGradient>
            <View>
              <Text style={styles.headerTitle}>ASA Conseiller</Text>
              <Text style={styles.headerSubtitle}>
                {isLoading ? '🟡 Analyse en cours...' : '🟢 En ligne • Claude Opus'}
              </Text>
            </View>
          </View>
          <TouchableOpacity onPress={clearChatHistory} style={styles.clearBtn}>
            <Ionicons name="trash-outline" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={0}
        >
          {/* Messages */}
          <ScrollView
            ref={scrollViewRef}
            style={styles.messages}
            contentContainerStyle={styles.messagesContent}
            showsVerticalScrollIndicator={false}
          >
            {allMessages.map(msg => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
            {streamingText !== '' && (
              <View style={styles.messageRow}>
                <View style={styles.avatarContainer}>
                  <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.avatar}>
                    <Text style={styles.avatarText}>A</Text>
                  </LinearGradient>
                </View>
                <View style={[styles.bubble, styles.bubbleAssistant]}>
                  <Text style={styles.messageText}>{streamingText}</Text>
                  <View style={styles.typingDots}>
                    <ActivityIndicator size="small" color={COLORS.primary} />
                  </View>
                </View>
              </View>
            )}
            {isLoading && streamingText === '' && (
              <View style={styles.messageRow}>
                <View style={styles.avatarContainer}>
                  <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.avatar}>
                    <Text style={styles.avatarText}>A</Text>
                  </LinearGradient>
                </View>
                <View style={[styles.bubble, styles.bubbleAssistant, styles.loadingBubble]}>
                  <ActivityIndicator size="small" color={COLORS.primary} />
                  <Text style={styles.loadingText}>Analyse en cours...</Text>
                </View>
              </View>
            )}
          </ScrollView>

          {/* Quick Prompts */}
          {chatHistory.length === 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.quickPrompts}
              contentContainerStyle={styles.quickPromptsContent}
            >
              {QUICK_PROMPTS.map((p, i) => (
                <TouchableOpacity
                  key={i}
                  style={styles.quickPromptBtn}
                  onPress={() => handleSend(p.prompt)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.quickPromptText}>{p.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          {/* Input */}
          <View style={styles.inputContainer}>
            <View style={styles.inputRow}>
              <TextInput
                ref={inputRef}
                style={styles.input}
                value={inputText}
                onChangeText={setInputText}
                placeholder="Posez votre question sur les marchés..."
                placeholderTextColor={COLORS.textMuted}
                multiline
                maxLength={500}
                returnKeyType="send"
                onSubmitEditing={() => handleSend()}
              />
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  (!inputText.trim() || isLoading) && styles.sendButtonDisabled,
                ]}
                onPress={() => handleSend()}
                disabled={!inputText.trim() || isLoading}
                activeOpacity={0.7}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color={COLORS.background} />
                ) : (
                  <Ionicons name="send" size={18} color={COLORS.background} />
                )}
              </TouchableOpacity>
            </View>
            <Text style={styles.inputDisclaimer}>
              Informatif uniquement • Pas de conseil financier réglementé
            </Text>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  safeArea: { flex: 1 },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  headerAvatar: {
    width: 40, height: 40, borderRadius: RADIUS.full,
    justifyContent: 'center', alignItems: 'center',
  },
  headerAvatarText: { color: COLORS.background, fontWeight: FONTS.weights.bold, fontSize: FONTS.sizes.lg },
  headerTitle: { fontSize: FONTS.sizes.base, fontWeight: FONTS.weights.bold, color: COLORS.text },
  headerSubtitle: { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary },
  clearBtn: { padding: SPACING.sm },
  messages: { flex: 1 },
  messagesContent: { padding: SPACING.base, paddingBottom: SPACING.sm },
  messageRow: { flexDirection: 'row', marginBottom: SPACING.md, alignItems: 'flex-end' },
  messageRowUser: { flexDirection: 'row-reverse' },
  avatarContainer: { marginRight: SPACING.sm, marginBottom: 4 },
  avatar: { width: 32, height: 32, borderRadius: RADIUS.full, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: COLORS.background, fontWeight: FONTS.weights.bold, fontSize: FONTS.sizes.sm },
  bubble: {
    maxWidth: '78%',
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
  },
  bubbleUser: {
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: RADIUS.sm,
  },
  bubbleAssistant: {
    backgroundColor: COLORS.card,
    borderBottomLeftRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  loadingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  messageText: { fontSize: FONTS.sizes.sm, color: COLORS.text, lineHeight: 20 },
  messageTextUser: { color: COLORS.background },
  messageBold: { fontWeight: FONTS.weights.bold, color: COLORS.primary },
  timestamp: { fontSize: 10, color: COLORS.textMuted, marginTop: 4, alignSelf: 'flex-end' },
  typingDots: { marginTop: SPACING.sm },
  loadingText: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary },
  quickPrompts: { maxHeight: 52 },
  quickPromptsContent: { paddingHorizontal: SPACING.base, paddingVertical: SPACING.sm, gap: SPACING.sm },
  quickPromptBtn: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  quickPromptText: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary },
  inputContainer: {
    padding: SPACING.base,
    paddingBottom: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: SPACING.sm },
  input: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.sm,
    color: COLORS.text,
    fontSize: FONTS.sizes.sm,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sendButton: {
    width: 40, height: 40,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: { backgroundColor: COLORS.textMuted },
  inputDisclaimer: {
    fontSize: 10,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
});
