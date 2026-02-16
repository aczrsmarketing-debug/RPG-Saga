import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, STATS_TYPES } from '../config/theme';
import { generateMissionWithAI } from '../services/api';

export default function AIChatScreen({ character, onMissionGenerated, darkMode }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: '⚔️ Bienvenido, Hunter. Soy tu asistente IA para crear Sagas épicas.\n\nDime qué hábito quieres desarrollar y crearé una misión completa de 90 días para ti.\n\nEjemplos:\n• "Quiero ir al gym 5 veces por semana"\n• "Necesito estudiar programación 1 hora diaria"\n• "Quiero meditar y llevar un journal"',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiType, setApiType] = useState('claude'); // 'claude' o 'chatgpt'
  const scrollViewRef = useRef();

  const colors = darkMode ? {
    bg: COLORS.darkBg,
    card: COLORS.darkCard,
    text: COLORS.darkText,
    input: COLORS.darkCard,
  } : {
    bg: COLORS.background,
    card: COLORS.cardBg,
    text: COLORS.textPrimary,
    input: COLORS.cardBg,
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    
    // Agregar mensaje del usuario
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      // Generar misión con IA
      const missionData = await generateMissionWithAI(userMessage, apiType);
      
      // Mensaje de confirmación
      const confirmMessage = `✅ He creado tu misión:\n\n📜 ${missionData.saga.name}\n🎯 Categoría: ${missionData.saga.category}\n\n¿Quieres activar esta saga ahora?`;
      
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: confirmMessage, missionData },
      ]);
    } catch (error) {
      setMessages(prev => [
        ...prev,
        { 
          role: 'assistant', 
          content: '❌ Error al generar la misión. Verifica que hayas configurado tu API key en Configuración.' 
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const activateMission = (missionData) => {
    try {
      onMissionGenerated(missionData);
      setMessages(prev => [
        ...prev,
        { 
          role: 'assistant', 
          content: '🎉 ¡Misión activada! Ve a la pantalla principal para empezar tus tareas diarias.' 
        },
      ]);
    } catch (error) {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: `❌ ${error.message}` },
      ]);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.bg }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      {/* Toggle API Type */}
      <View style={styles.apiToggle}>
        <TouchableOpacity
          style={[
            styles.apiButton,
            apiType === 'claude' && { backgroundColor: COLORS.primary }
          ]}
          onPress={() => setApiType('claude')}
        >
          <Text style={[
            styles.apiButtonText,
            apiType === 'claude' && { color: '#FFFFFF' }
          ]}>
            Claude
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.apiButton,
            apiType === 'chatgpt' && { backgroundColor: COLORS.primary }
          ]}
          onPress={() => setApiType('chatgpt')}
        >
          <Text style={[
            styles.apiButtonText,
            apiType === 'chatgpt' && { color: '#FFFFFF' }
          ]}>
            ChatGPT
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd()}
      >
        {messages.map((message, index) => (
          <View key={index}>
            <MessageBubble
              message={message}
              darkMode={darkMode}
              onActivate={message.missionData ? () => activateMission(message.missionData) : null}
            />
          </View>
        ))}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={COLORS.primary} />
            <Text style={[styles.loadingText, { color: COLORS.secondary }]}>
              Generando tu saga épica...
            </Text>
          </View>
        )}
      </ScrollView>

      <View style={[styles.inputContainer, { backgroundColor: colors.input }]}>
        <TextInput
          style={[styles.input, { color: colors.text }]}
          value={input}
          onChangeText={setInput}
          placeholder="Describe tu hábito..."
          placeholderTextColor={COLORS.secondary}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            (!input.trim() || isLoading) && styles.sendButtonDisabled
          ]}
          onPress={sendMessage}
          disabled={!input.trim() || isLoading}
        >
          <Text style={styles.sendButtonText}>Enviar</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

function MessageBubble({ message, darkMode, onActivate }) {
  const isUser = message.role === 'user';
  const colors = darkMode ? {
    userBg: COLORS.primary,
    assistantBg: COLORS.darkCard,
    text: COLORS.darkText,
  } : {
    userBg: COLORS.primary,
    assistantBg: COLORS.cardBg,
    text: COLORS.textPrimary,
  };

  return (
    <View style={[
      styles.messageBubble,
      isUser ? styles.userBubble : styles.assistantBubble,
      { backgroundColor: isUser ? colors.userBg : colors.assistantBg }
    ]}>
      <Text style={[
        styles.messageText,
        { color: isUser ? '#FFFFFF' : colors.text }
      ]}>
        {message.content}
      </Text>
      
      {onActivate && (
        <TouchableOpacity
          style={styles.activateButton}
          onPress={onActivate}
        >
          <Text style={styles.activateButtonText}>✓ Activar Misión</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  apiToggle: {
    flexDirection: 'row',
    padding: SPACING.sm,
    gap: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  apiButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  apiButtonText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.textPrimary,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: SPACING.md,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: SPACING.md,
    borderRadius: 12,
    marginBottom: SPACING.sm,
  },
  userBubble: {
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  messageText: {
    fontSize: TYPOGRAPHY.sizes.base,
    lineHeight: 20,
  },
  activateButton: {
    marginTop: SPACING.md,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    alignItems: 'center',
  },
  activateButtonText: {
    color: '#FFFFFF',
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
  },
  loadingText: {
    marginLeft: SPACING.sm,
    fontSize: TYPOGRAPHY.sizes.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.base,
    maxHeight: 100,
    marginRight: SPACING.sm,
  },
  sendButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderRadius: 8,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
});
