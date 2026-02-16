import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  TextInput,
  Switch,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as LocalAuthentication from 'expo-local-authentication';
import { COLORS, TYPOGRAPHY, SPACING } from '../config/theme';
import { storage } from '../services/storage';
import { API_CONFIG } from '../services/api';

export default function ProfileScreen({ 
  character, 
  darkMode, 
  onToggleDarkMode,
  onUpdateCharacter,
  onLogout 
}) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(character.name);
  const [claudeKey, setClaudeKey] = useState('');
  const [openaiKey, setOpenaiKey] = useState('');
  const [sheetsUrl, setSheetsUrl] = useState('');

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

  const pickAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permiso Denegado', 'Necesitamos acceso a tu galería');
      return;
    }

    const result = await ImagePicker.launchImagePickerAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      onUpdateCharacter({ avatar: result.assets[0].uri });
    }
  };

  const saveName = () => {
    if (newName.trim()) {
      onUpdateCharacter({ name: newName.trim() });
      setIsEditingName(false);
    }
  };

  const saveAPIKeys = async () => {
    const keys = {
      claude: claudeKey,
      openai: openaiKey,
      sheets: sheetsUrl,
    };
    
    // Actualizar config global
    if (claudeKey) API_CONFIG.CLAUDE_API_KEY = claudeKey;
    if (openaiKey) API_CONFIG.OPENAI_API_KEY = openaiKey;
    if (sheetsUrl) API_CONFIG.SHEETS_API_URL = sheetsUrl;
    
    await storage.saveAPIKeys(keys);
    Alert.alert('✓ Guardado', 'Tus API keys han sido guardadas de forma segura');
  };

  const testBiometric = async () => {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    if (!compatible) {
      Alert.alert('No Compatible', 'Tu dispositivo no soporta biometría');
      return;
    }

    const enrolled = await LocalAuthentication.isEnrolledAsync();
    if (!enrolled) {
      Alert.alert('No Configurado', 'Configura tu huella o Face ID en ajustes');
      return;
    }

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Autenticar con biometría',
    });

    if (result.success) {
      Alert.alert('✓ Autenticado', '¡Biometría funcionando!');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Seguro que quieres salir? Tus datos están guardados.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Salir', style: 'destructive', onPress: onLogout },
      ]
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.bg }]}>
      {/* Avatar y nombre */}
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <TouchableOpacity onPress={pickAvatar} style={styles.avatarContainer}>
          {character.avatar ? (
            <Image source={{ uri: character.avatar }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatarPlaceholder, { backgroundColor: COLORS.primary }]}>
              <Text style={styles.avatarPlaceholderText}>
                {character.name.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          <View style={styles.avatarEditBadge}>
            <Text style={styles.avatarEditText}>Editar</Text>
          </View>
        </TouchableOpacity>

        {isEditingName ? (
          <View style={styles.nameEditContainer}>
            <TextInput
              style={[styles.nameInput, { color: colors.text, backgroundColor: colors.input }]}
              value={newName}
              onChangeText={setNewName}
              autoFocus
              maxLength={20}
            />
            <TouchableOpacity
              style={styles.saveButton}
              onPress={saveName}
            >
              <Text style={styles.saveButtonText}>✓</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity onPress={() => setIsEditingName(true)}>
            <Text style={[styles.characterName, { color: colors.text }]}>
              {character.name}
            </Text>
          </TouchableOpacity>
        )}

        <Text style={[styles.characterId, { color: COLORS.secondary }]}>
          ID: {character.id}
        </Text>
      </View>

      {/* Configuración de APIs */}
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Configuración de IA
        </Text>
        
        <Text style={[styles.label, { color: colors.text }]}>Claude API Key</Text>
        <TextInput
          style={[styles.input, { color: colors.text, backgroundColor: colors.input }]}
          value={claudeKey}
          onChangeText={setClaudeKey}
          placeholder="sk-ant-..."
          placeholderTextColor={COLORS.secondary}
          secureTextEntry
          autoCapitalize="none"
        />

        <Text style={[styles.label, { color: colors.text }]}>OpenAI API Key</Text>
        <TextInput
          style={[styles.input, { color: colors.text, backgroundColor: colors.input }]}
          value={openaiKey}
          onChangeText={setOpenaiKey}
          placeholder="sk-..."
          placeholderTextColor={COLORS.secondary}
          secureTextEntry
          autoCapitalize="none"
        />

        <Text style={[styles.label, { color: colors.text }]}>Google Sheets URL</Text>
        <TextInput
          style={[styles.input, { color: colors.text, backgroundColor: colors.input }]}
          value={sheetsUrl}
          onChangeText={setSheetsUrl}
          placeholder="https://script.google.com/..."
          placeholderTextColor={COLORS.secondary}
          autoCapitalize="none"
        />

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={saveAPIKeys}
        >
          <Text style={styles.primaryButtonText}>Guardar Configuración</Text>
        </TouchableOpacity>
      </View>

      {/* Preferencias */}
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Preferencias
        </Text>

        <View style={styles.settingRow}>
          <Text style={[styles.settingLabel, { color: colors.text }]}>
            Modo Oscuro
          </Text>
          <Switch
            value={darkMode}
            onValueChange={onToggleDarkMode}
            trackColor={{ false: COLORS.backgroundAlt, true: COLORS.primary }}
            thumbColor={darkMode ? COLORS.secondary : COLORS.cardBg}
          />
        </View>

        <TouchableOpacity
          style={styles.settingButton}
          onPress={testBiometric}
        >
          <Text style={[styles.settingLabel, { color: colors.text }]}>
            Probar Biometría
          </Text>
          <Text style={styles.settingArrow}>→</Text>
        </TouchableOpacity>
      </View>

      {/* Información */}
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Información
        </Text>
        
        <InfoRow label="Versión" value="1.0.0" darkMode={darkMode} />
        <InfoRow label="Cuenta creada" value={new Date(character.createdAt).toLocaleDateString()} darkMode={darkMode} />
        <InfoRow label="Último acceso" value={new Date(character.lastLogin).toLocaleDateString()} darkMode={darkMode} />
      </View>

      {/* Acciones */}
      <TouchableOpacity
        style={[styles.dangerButton, { marginBottom: SPACING.xxl }]}
        onPress={handleLogout}
      >
        <Text style={styles.dangerButtonText}>Cerrar Sesión</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function InfoRow({ label, value, darkMode }) {
  const textColor = darkMode ? COLORS.darkText : COLORS.textPrimary;
  return (
    <View style={styles.infoRow}>
      <Text style={[styles.infoLabel, { color: COLORS.secondary }]}>{label}</Text>
      <Text style={[styles.infoValue, { color: textColor }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    margin: SPACING.md,
    padding: SPACING.lg,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  avatarContainer: {
    alignSelf: 'center',
    position: 'relative',
    marginBottom: SPACING.md,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: COLORS.primary,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: COLORS.primary,
  },
  avatarPlaceholderText: {
    color: '#FFFFFF',
    fontSize: TYPOGRAPHY.sizes.xxxl * 2,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.danger,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
  },
  avatarEditText: {
    color: '#FFFFFF',
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  characterName: {
    fontSize: TYPOGRAPHY.sizes.xxl,
    fontWeight: TYPOGRAPHY.weights.bold,
    textAlign: 'center',
  },
  characterId: {
    fontSize: TYPOGRAPHY.sizes.sm,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  nameEditContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  nameInput: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    textAlign: 'center',
    padding: SPACING.sm,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
    marginTop: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  input: {
    fontSize: TYPOGRAPHY.sizes.base,
    padding: SPACING.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  settingButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  settingLabel: {
    fontSize: TYPOGRAPHY.sizes.base,
  },
  settingArrow: {
    fontSize: TYPOGRAPHY.sizes.lg,
    color: COLORS.secondary,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
  },
  infoLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
  },
  infoValue: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  dangerButton: {
    backgroundColor: COLORS.danger,
    padding: SPACING.md,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: SPACING.md,
  },
  dangerButtonText: {
    color: '#FFFFFF',
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
});
