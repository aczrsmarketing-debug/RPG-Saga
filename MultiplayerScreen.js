import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Share,
  Alert,
  RefreshControl,
  Image,
} from 'react-native';
import * as Linking from 'expo-linking';
import { COLORS, TYPOGRAPHY, SPACING, RANKS } from '../config/theme';
import { sheetsAPI } from '../services/api';
import { storage } from '../services/storage';

export default function MultiplayerScreen({ character, darkMode }) {
  const [sheetId, setSheetId] = useState('');
  const [leaderboard, setLeaderboard] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

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

  useEffect(() => {
    loadSharedSheet();
  }, []);

  const loadSharedSheet = async () => {
    const savedSheet = await storage.getSharedSheet();
    if (savedSheet) {
      setSheetId(savedSheet);
      fetchLeaderboard(savedSheet);
    }
  };

  const generateInviteLink = async () => {
    if (!sheetId) {
      Alert.alert('Error', 'Debes configurar un Google Sheet ID primero');
      return;
    }

    const inviteUrl = Linking.createURL('join', {
      queryParams: { sheetId }
    });

    try {
      await Share.share({
        message: `¡Únete a mi grupo de Saga de Hábitos! 🎮\n\nCompite conmigo en el desarrollo de hábitos.\n\nEnlace: ${inviteUrl}`,
        title: 'Invitación a Saga de Hábitos',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const joinGroup = async (newSheetId) => {
    setSheetId(newSheetId);
    await storage.saveSharedSheet(newSheetId);
    fetchLeaderboard(newSheetId);
    Alert.alert('✓ Unido', 'Te has unido al grupo');
  };

  const fetchLeaderboard = async (id = sheetId) => {
    if (!id) return;
    
    setIsLoading(true);
    try {
      const data = await sheetsAPI.getLeaderboard(id);
      
      // Ordenar por puntos totales
      const sorted = data.sort((a, b) => b.totalPoints - a.totalPoints);
      setLeaderboard(sorted);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      Alert.alert('Error', 'No se pudo cargar el leaderboard. Verifica tu configuración de Google Sheets.');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchLeaderboard();
    setRefreshing(false);
  };

  const syncMyData = async () => {
    if (!sheetId) {
      Alert.alert('Error', 'Configura un Sheet ID primero');
      return;
    }

    try {
      await sheetsAPI.saveUserData({
        userId: character.id,
        name: character.name,
        level: character.level,
        rank: character.rank,
        totalPoints: character.totalPoints,
        stats: character.stats,
        avatar: character.avatar,
        sheetId: sheetId,
      });
      
      Alert.alert('✓ Sincronizado', 'Tus datos han sido actualizados');
      fetchLeaderboard();
    } catch (error) {
      console.error('Error syncing:', error);
      Alert.alert('Error', 'No se pudo sincronizar. Verifica tu configuración.');
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.bg }]}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={COLORS.primary}
        />
      }
    >
      {/* Configuración de Sheet */}
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Configurar Grupo
        </Text>
        
        <Text style={[styles.label, { color: colors.text }]}>
          Google Sheet ID
        </Text>
        <Text style={[styles.hint, { color: COLORS.secondary }]}>
          Crea un Google Sheet y pega su ID aquí
        </Text>
        
        <TextInput
          style={[styles.input, { color: colors.text, backgroundColor: colors.input }]}
          value={sheetId}
          onChangeText={setSheetId}
          placeholder="1A2B3C4D5E6F..."
          placeholderTextColor={COLORS.secondary}
          autoCapitalize="none"
        />

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={() => storage.saveSharedSheet(sheetId)}
          >
            <Text style={styles.buttonText}>Guardar</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={generateInviteLink}
          >
            <Text style={styles.buttonText}>Invitar</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.syncButton}
          onPress={syncMyData}
        >
          <Text style={[styles.syncButtonText, { color: COLORS.primary }]}>
            ↻ Sincronizar Mis Datos
          </Text>
        </TouchableOpacity>
      </View>

      {/* Leaderboard */}
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Clasificación
        </Text>

        {leaderboard.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: colors.text }]}>
              {isLoading ? 'Cargando...' : 'No hay datos aún'}
            </Text>
            <Text style={[styles.emptySubtext, { color: COLORS.secondary }]}>
              {!isLoading && 'Sincroniza tus datos y comparte el enlace con amigos'}
            </Text>
          </View>
        ) : (
          leaderboard.map((player, index) => (
            <LeaderboardItem
              key={player.userId}
              player={player}
              position={index + 1}
              isCurrentUser={player.userId === character.id}
              darkMode={darkMode}
            />
          ))
        )}
      </View>

      {/* Mi posición */}
      {leaderboard.length > 0 && (
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Mi Perfil vs Grupo
          </Text>

          <ComparisonStat
            label="Mi Posición"
            value={`#${leaderboard.findIndex(p => p.userId === character.id) + 1}`}
            darkMode={darkMode}
          />
          <ComparisonStat
            label="Mi Puntuación"
            value={character.totalPoints}
            total={Math.max(...leaderboard.map(p => p.totalPoints))}
            darkMode={darkMode}
          />
          <ComparisonStat
            label="Mi Nivel"
            value={character.level}
            total={Math.max(...leaderboard.map(p => p.level))}
            darkMode={darkMode}
          />
        </View>
      )}
    </ScrollView>
  );
}

function LeaderboardItem({ player, position, isCurrentUser, darkMode }) {
  const colors = darkMode ? {
    text: COLORS.darkText,
  } : {
    text: COLORS.textPrimary,
  };

  const rankData = RANKS[player.rank];
  const positionColor = position === 1 ? '#FFD700' : position === 2 ? '#C0C0C0' : position === 3 ? '#CD7F32' : COLORS.secondary;

  return (
    <View style={[
      styles.leaderboardItem,
      isCurrentUser && styles.currentUserItem
    ]}>
      <View style={styles.itemLeft}>
        <View style={[styles.positionBadge, { backgroundColor: positionColor }]}>
          <Text style={styles.positionText}>{position}</Text>
        </View>

        {player.avatar ? (
          <Image source={{ uri: player.avatar }} style={styles.playerAvatar} />
        ) : (
          <View style={[styles.playerAvatarPlaceholder, { backgroundColor: COLORS.primary }]}>
            <Text style={styles.playerAvatarText}>
              {player.name.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}

        <View style={styles.playerInfo}>
          <Text style={[styles.playerName, { color: colors.text }]}>
            {player.name}
            {isCurrentUser && ' (Tú)'}
          </Text>
          <View style={styles.playerStats}>
            <View style={[styles.rankChip, { backgroundColor: rankData.color }]}>
              <Text style={styles.rankChipText}>{player.rank}</Text>
            </View>
            <Text style={[styles.playerLevel, { color: COLORS.secondary }]}>
              Nv. {player.level}
            </Text>
          </View>
        </View>
      </View>

      <Text style={[styles.playerPoints, { color: COLORS.primary }]}>
        {player.totalPoints} pts
      </Text>
    </View>
  );
}

function ComparisonStat({ label, value, total, darkMode }) {
  const percentage = total ? (value / total) * 100 : 100;
  const textColor = darkMode ? COLORS.darkText : COLORS.textPrimary;

  return (
    <View style={styles.comparisonStat}>
      <Text style={[styles.comparisonLabel, { color: textColor }]}>
        {label}
      </Text>
      <View style={styles.comparisonRight}>
        <Text style={[styles.comparisonValue, { color: COLORS.primary }]}>
          {value}
        </Text>
        {total && (
          <View style={styles.comparisonBar}>
            <View 
              style={[
                styles.comparisonBarFill,
                { width: `${percentage}%`, backgroundColor: COLORS.primary }
              ]} 
            />
          </View>
        )}
      </View>
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
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
    marginBottom: SPACING.xs,
  },
  hint: {
    fontSize: TYPOGRAPHY.sizes.xs,
    marginBottom: SPACING.sm,
  },
  input: {
    fontSize: TYPOGRAPHY.sizes.base,
    padding: SPACING.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  button: {
    flex: 1,
    padding: SPACING.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
  },
  secondaryButton: {
    backgroundColor: COLORS.secondary,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  syncButton: {
    marginTop: SPACING.md,
    padding: SPACING.md,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.primary,
    alignItems: 'center',
  },
  syncButtonText: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  emptyState: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  emptySubtext: {
    fontSize: TYPOGRAPHY.sizes.sm,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
  leaderboardItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: 8,
    backgroundColor: COLORS.backgroundAlt,
    marginBottom: SPACING.sm,
  },
  currentUserItem: {
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  positionBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  positionText: {
    color: '#FFFFFF',
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  playerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: SPACING.sm,
  },
  playerAvatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  playerAvatarText: {
    color: '#FFFFFF',
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  playerStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
    gap: SPACING.sm,
  },
  rankChip: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: 4,
  },
  rankChipText: {
    color: '#FFFFFF',
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  playerLevel: {
    fontSize: TYPOGRAPHY.sizes.xs,
  },
  playerPoints: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  comparisonStat: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  comparisonLabel: {
    fontSize: TYPOGRAPHY.sizes.base,
    flex: 1,
  },
  comparisonRight: {
    alignItems: 'flex-end',
    flex: 1,
  },
  comparisonValue: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    marginBottom: SPACING.xs,
  },
  comparisonBar: {
    width: '100%',
    height: 8,
    backgroundColor: COLORS.backgroundAlt,
    borderRadius: 4,
    overflow: 'hidden',
  },
  comparisonBarFill: {
    height: '100%',
    borderRadius: 4,
  },
});
