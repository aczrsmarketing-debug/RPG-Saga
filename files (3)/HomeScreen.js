import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, TYPOGRAPHY, SPACING, RANKS } from '../config/theme';

const { width } = Dimensions.get('window');

export default function HomeScreen({ character, onCompleteTask, darkMode }) {
  const [selectedMission, setSelectedMission] = useState(0);
  const colors = darkMode ? {
    bg: COLORS.darkBg,
    card: COLORS.darkCard,
    text: COLORS.darkText,
  } : {
    bg: COLORS.background,
    card: COLORS.cardBg,
    text: COLORS.textPrimary,
  };

  const currentRank = RANKS[character.rank];
  const xpProgress = (character.xp / character.getXPForNextLevel()) * 100;
  const hpProgress = (character.stats.hp / character.stats.maxHp) * 100;

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.bg }]}>
      {/* Header con stats del personaje */}
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <View style={styles.headerTop}>
          <View>
            <Text style={[styles.hunterName, { color: colors.text }]}>{character.name}</Text>
            <Text style={[styles.hunterTitle, { color: COLORS.secondary }]}>
              Rango {character.rank} · Nivel {character.level}
            </Text>
          </View>
          <View style={[styles.rankBadge, { backgroundColor: currentRank.color }]}>
            <Text style={styles.rankText}>{character.rank}</Text>
          </View>
        </View>

        {/* Barra de HP */}
        <View style={styles.statContainer}>
          <Text style={[styles.statLabel, { color: colors.text }]}>HP</Text>
          <View style={styles.barContainer}>
            <View style={styles.barBackground}>
              <View 
                style={[
                  styles.barFill, 
                  { 
                    width: `${hpProgress}%`,
                    backgroundColor: hpProgress > 30 ? COLORS.primary : COLORS.danger 
                  }
                ]} 
              />
            </View>
            <Text style={[styles.barText, { color: colors.text }]}>
              {character.stats.hp}/{character.stats.maxHp}
            </Text>
          </View>
        </View>

        {/* Barra de XP */}
        <View style={styles.statContainer}>
          <Text style={[styles.statLabel, { color: colors.text }]}>XP</Text>
          <View style={styles.barContainer}>
            <View style={styles.barBackground}>
              <View 
                style={[
                  styles.barFill, 
                  { width: `${xpProgress}%`, backgroundColor: COLORS.secondary }
                ]} 
              />
            </View>
            <Text style={[styles.barText, { color: colors.text }]}>
              {character.xp}/{character.getXPForNextLevel()}
            </Text>
          </View>
        </View>

        {/* Stats secundarios */}
        <View style={styles.statsRow}>
          <StatPill label="Salud" value={character.stats.salud} color={COLORS.primary} darkMode={darkMode} />
          <StatPill label="Mente" value={character.stats.mente} color={COLORS.darkBlue} darkMode={darkMode} />
          <StatPill label="Vida" value={character.stats.vida} color={COLORS.darkGreen} darkMode={darkMode} />
        </View>
      </View>

      {/* Misiones activas */}
      <View style={styles.missionsSection}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Misiones Activas ({character.activeMissions.length}/3)
        </Text>

        {character.activeMissions.length === 0 ? (
          <View style={[styles.emptyState, { backgroundColor: colors.card }]}>
            <Text style={[styles.emptyText, { color: colors.text }]}>
              No tienes misiones activas
            </Text>
            <Text style={[styles.emptySubtext, { color: COLORS.secondary }]}>
              Ve a "Chat IA" para crear tu primera saga
            </Text>
          </View>
        ) : (
          character.activeMissions.map((mission, index) => (
            <MissionCard
              key={index}
              mission={mission}
              character={character}
              onCompleteTask={(taskType, taskIndex) => 
                onCompleteTask(index, taskType, taskIndex)
              }
              darkMode={darkMode}
            />
          ))
        )}
      </View>
    </ScrollView>
  );
}

function StatPill({ label, value, color, darkMode }) {
  return (
    <View style={[styles.statPill, { backgroundColor: color }]}>
      <Text style={styles.statPillLabel}>{label}</Text>
      <Text style={styles.statPillValue}>{value}</Text>
    </View>
  );
}

function MissionCard({ mission, character, onCompleteTask, darkMode }) {
  const colors = darkMode ? {
    card: COLORS.darkCard,
    text: COLORS.darkText,
  } : {
    card: COLORS.cardBg,
    text: COLORS.textPrimary,
  };

  const currentMission = mission.missions[mission.currentMissionIndex];
  const today = new Date().toISOString().split('T')[0];
  const completedToday = mission.progress.dailyCompleted[today] || [];

  return (
    <View style={[styles.missionCard, { backgroundColor: colors.card }]}>
      <View style={styles.missionHeader}>
        <View>
          <Text style={[styles.missionSaga, { color: COLORS.danger }]}>
            {mission.saga.name}
          </Text>
          <Text style={[styles.missionName, { color: colors.text }]}>
            {currentMission.name}
          </Text>
        </View>
        <View style={[
          styles.categoryBadge,
          { backgroundColor: getCategoryColor(mission.saga.category) }
        ]}>
          <Text style={styles.categoryText}>{mission.saga.category}</Text>
        </View>
      </View>

      <Text style={[styles.missionDesc, { color: COLORS.secondary }]}>
        {currentMission.description}
      </Text>

      {/* Tareas diarias */}
      <Text style={[styles.tasksSectionTitle, { color: colors.text }]}>
        Tareas Diarias
      </Text>
      {currentMission.dailyTasks.map((task, index) => {
        const isCompleted = completedToday.includes(index);
        return (
          <TouchableOpacity
            key={index}
            style={[
              styles.taskItem,
              isCompleted && styles.taskCompleted
            ]}
            onPress={() => !isCompleted && onCompleteTask('daily', index)}
            disabled={isCompleted}
          >
            <View style={styles.taskLeft}>
              <View style={[
                styles.checkbox,
                isCompleted && { backgroundColor: COLORS.primary }
              ]}>
                {isCompleted && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={[
                styles.taskName,
                { color: colors.text },
                isCompleted && styles.taskNameCompleted
              ]}>
                {task.name}
              </Text>
            </View>
            <Text style={[styles.taskXP, { color: COLORS.secondary }]}>
              +{task.xp} XP
            </Text>
          </TouchableOpacity>
        );
      })}

      {/* Tareas semanales */}
      {currentMission.weeklyTasks.length > 0 && (
        <>
          <Text style={[styles.tasksSectionTitle, { color: colors.text }]}>
            Retos Semanales
          </Text>
          {currentMission.weeklyTasks.map((task, index) => {
            const weekNum = Math.floor(
              (Date.now() - mission.startedAt) / (7 * 24 * 60 * 60 * 1000)
            );
            const completedWeeks = mission.progress.weeklyCompleted[weekNum] || [];
            const isCompleted = completedWeeks.includes(index);
            
            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.taskItem,
                  styles.weeklyTask,
                  isCompleted && styles.taskCompleted
                ]}
                onPress={() => !isCompleted && onCompleteTask('weekly', index)}
                disabled={isCompleted}
              >
                <View style={styles.taskLeft}>
                  <View style={[
                    styles.checkbox,
                    isCompleted && { backgroundColor: COLORS.danger }
                  ]}>
                    {isCompleted && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                  <Text style={[
                    styles.taskName,
                    { color: colors.text },
                    isCompleted && styles.taskNameCompleted
                  ]}>
                    {task.name}
                  </Text>
                </View>
                <Text style={[styles.taskXP, { color: COLORS.danger }]}>
                  +{task.xp} XP
                </Text>
              </TouchableOpacity>
            );
          })}
        </>
      )}
    </View>
  );
}

function getCategoryColor(category) {
  switch (category) {
    case 'Salud': return COLORS.primary;
    case 'Mente': return COLORS.darkBlue;
    case 'Vida': return COLORS.darkGreen;
    default: return COLORS.secondary;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: SPACING.lg,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.border,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  hunterName: {
    fontSize: TYPOGRAPHY.sizes.xxl,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  hunterTitle: {
    fontSize: TYPOGRAPHY.sizes.base,
    marginTop: SPACING.xs,
  },
  rankBadge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankText: {
    color: '#FFFFFF',
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  statContainer: {
    marginBottom: SPACING.sm,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
    marginBottom: SPACING.xs,
  },
  barContainer: {
    position: 'relative',
  },
  barBackground: {
    height: 24,
    backgroundColor: COLORS.backgroundAlt,
    borderRadius: 12,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 12,
  },
  barText: {
    position: 'absolute',
    right: SPACING.sm,
    top: 4,
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.md,
  },
  statPill: {
    flex: 1,
    marginHorizontal: SPACING.xs,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
    alignItems: 'center',
  },
  statPillLabel: {
    color: '#FFFFFF',
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  statPillValue: {
    color: '#FFFFFF',
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    marginTop: SPACING.xs,
  },
  missionsSection: {
    padding: SPACING.lg,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    marginBottom: SPACING.md,
  },
  emptyState: {
    padding: SPACING.xl,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
  },
  emptyText: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  emptySubtext: {
    fontSize: TYPOGRAPHY.sizes.sm,
    marginTop: SPACING.xs,
  },
  missionCard: {
    padding: SPACING.lg,
    borderRadius: 12,
    marginBottom: SPACING.md,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  missionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  missionSaga: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  missionName: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    marginTop: SPACING.xs,
  },
  categoryBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 6,
  },
  categoryText: {
    color: '#FFFFFF',
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  missionDesc: {
    fontSize: TYPOGRAPHY.sizes.sm,
    marginBottom: SPACING.md,
  },
  tasksSectionTitle: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.semibold,
    marginTop: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  taskItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: 8,
    backgroundColor: COLORS.backgroundAlt,
    marginBottom: SPACING.xs,
  },
  weeklyTask: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.danger,
  },
  taskCompleted: {
    opacity: 0.5,
  },
  taskLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: COLORS.border,
    marginRight: SPACING.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  taskName: {
    fontSize: TYPOGRAPHY.sizes.base,
    flex: 1,
  },
  taskNameCompleted: {
    textDecorationLine: 'line-through',
  },
  taskXP: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
});
