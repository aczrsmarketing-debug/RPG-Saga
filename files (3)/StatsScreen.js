import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { LineChart, ProgressChart } from 'react-native-chart-kit';
import { COLORS, TYPOGRAPHY, SPACING, RANKS } from '../config/theme';

const { width } = Dimensions.get('window');

export default function StatsScreen({ character, darkMode }) {
  const colors = darkMode ? {
    bg: COLORS.darkBg,
    card: COLORS.darkCard,
    text: COLORS.darkText,
  } : {
    bg: COLORS.background,
    card: COLORS.cardBg,
    text: COLORS.textPrimary,
  };

  // Datos para gráfico de progreso por categoría
  const categoryProgress = {
    labels: ['Salud', 'Mente', 'Vida'],
    data: [
      character.stats.salud / 1000, // Normalizar a 0-1
      character.stats.mente / 1000,
      character.stats.vida / 1000,
    ],
  };

  // Chart config
  const chartConfig = {
    backgroundColor: colors.card,
    backgroundGradientFrom: colors.card,
    backgroundGradientTo: colors.card,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(103, 156, 188, ${opacity})`,
    labelColor: (opacity = 1) => darkMode 
      ? `rgba(254, 241, 213, ${opacity})`
      : `rgba(3, 17, 13, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: COLORS.primary,
    },
  };

  const currentRank = RANKS[character.rank];
  const nextRankKey = Object.keys(RANKS)[Object.keys(RANKS).indexOf(character.rank) + 1];
  const nextRank = nextRankKey ? RANKS[nextRankKey] : null;

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.bg }]}>
      {/* Overview Card */}
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>Resumen</Text>
        
        <View style={styles.overviewGrid}>
          <OverviewStat
            label="Nivel"
            value={character.level}
            max={99}
            color={COLORS.primary}
            darkMode={darkMode}
          />
          <OverviewStat
            label="Rango"
            value={character.rank}
            color={currentRank.color}
            darkMode={darkMode}
          />
          <OverviewStat
            label="Pts Total"
            value={character.totalPoints}
            color={COLORS.secondary}
            darkMode={darkMode}
          />
          <OverviewStat
            label="HP"
            value={`${character.stats.hp}/${character.stats.maxHp}`}
            color={character.stats.hp > character.stats.maxHp * 0.3 ? COLORS.primary : COLORS.danger}
            darkMode={darkMode}
          />
        </View>
      </View>

      {/* Progreso por Categoría */}
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>
          Progreso por Habilidad
        </Text>
        
        <ProgressChart
          data={categoryProgress}
          width={width - SPACING.lg * 4}
          height={220}
          strokeWidth={16}
          radius={32}
          chartConfig={chartConfig}
          hideLegend={false}
          style={styles.chart}
        />

        <View style={styles.statsLegend}>
          <StatLegendItem
            label="Salud"
            value={character.stats.salud}
            color={COLORS.primary}
            darkMode={darkMode}
          />
          <StatLegendItem
            label="Mente"
            value={character.stats.mente}
            color={COLORS.darkBlue}
            darkMode={darkMode}
          />
          <StatLegendItem
            label="Vida"
            value={character.stats.vida}
            color={COLORS.darkGreen}
            darkMode={darkMode}
          />
        </View>
      </View>

      {/* Rango Actual */}
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>
          Sistema de Rangos
        </Text>

        <View style={styles.rankProgress}>
          <View style={[
            styles.currentRankBadge,
            { backgroundColor: currentRank.color }
          ]}>
            <Text style={styles.currentRankText}>Rango {character.rank}</Text>
            <Text style={styles.currentRankPoints}>{character.totalPoints} pts</Text>
          </View>

          {nextRank && (
            <>
              <View style={styles.rankArrow}>
                <Text style={[styles.arrowText, { color: colors.text }]}>→</Text>
              </View>
              <View style={[
                styles.nextRankBadge,
                { backgroundColor: nextRank.color }
              ]}>
                <Text style={styles.nextRankText}>Rango {nextRankKey}</Text>
                <Text style={styles.nextRankPoints}>
                  {nextRank.minPoints - character.totalPoints} pts restantes
                </Text>
              </View>
            </>
          )}
        </View>

        <View style={styles.allRanks}>
          {Object.entries(RANKS).map(([key, rank]) => (
            <View
              key={key}
              style={[
                styles.rankItem,
                { backgroundColor: rank.color },
                character.rank === key && styles.rankItemCurrent
              ]}
            >
              <Text style={styles.rankItemText}>{key}</Text>
              <Text style={styles.rankItemMinPoints}>{rank.minPoints}+</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Misiones Completadas */}
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>
          Historial de Sagas
        </Text>
        
        {character.completedMissions.length === 0 ? (
          <Text style={[styles.emptyText, { color: COLORS.secondary }]}>
            Aún no has completado ninguna saga
          </Text>
        ) : (
          character.completedMissions.map((mission, index) => (
            <View key={index} style={styles.completedMission}>
              <Text style={[styles.completedMissionName, { color: COLORS.primary }]}>
                ✓ {mission.saga.name}
              </Text>
              <Text style={[styles.completedMissionCategory, { color: colors.text }]}>
                {mission.saga.category}
              </Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

function OverviewStat({ label, value, max, color, darkMode }) {
  return (
    <View style={styles.overviewStat}>
      <Text style={[styles.overviewLabel, { color: COLORS.secondary }]}>
        {label}
      </Text>
      <Text style={[styles.overviewValue, { color }]}>
        {value}
      </Text>
      {max && (
        <Text style={[styles.overviewMax, { color: COLORS.secondary }]}>
          / {max}
        </Text>
      )}
    </View>
  );
}

function StatLegendItem({ label, value, color, darkMode }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={[styles.legendLabel, { color: darkMode ? COLORS.darkText : COLORS.textPrimary }]}>
        {label}
      </Text>
      <Text style={[styles.legendValue, { color }]}>
        {value}
      </Text>
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
  cardTitle: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    marginBottom: SPACING.md,
  },
  overviewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  overviewStat: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
  },
  overviewLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    marginBottom: SPACING.xs,
  },
  overviewValue: {
    fontSize: TYPOGRAPHY.sizes.xxl,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  overviewMax: {
    fontSize: TYPOGRAPHY.sizes.sm,
  },
  chart: {
    marginVertical: SPACING.md,
    borderRadius: 16,
  },
  statsLegend: {
    gap: SPACING.sm,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendLabel: {
    fontSize: TYPOGRAPHY.sizes.base,
    flex: 1,
  },
  legendValue: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  rankProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  currentRankBadge: {
    padding: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 100,
  },
  currentRankText: {
    color: '#FFFFFF',
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  currentRankPoints: {
    color: '#FFFFFF',
    fontSize: TYPOGRAPHY.sizes.sm,
    marginTop: SPACING.xs,
  },
  rankArrow: {
    marginHorizontal: SPACING.md,
  },
  arrowText: {
    fontSize: TYPOGRAPHY.sizes.xxl,
  },
  nextRankBadge: {
    padding: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 100,
    opacity: 0.7,
  },
  nextRankText: {
    color: '#FFFFFF',
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  nextRankPoints: {
    color: '#FFFFFF',
    fontSize: TYPOGRAPHY.sizes.xs,
    marginTop: SPACING.xs,
  },
  allRanks: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.xs,
  },
  rankItem: {
    flex: 1,
    padding: SPACING.sm,
    borderRadius: 8,
    alignItems: 'center',
  },
  rankItemCurrent: {
    borderWidth: 3,
    borderColor: COLORS.danger,
  },
  rankItemText: {
    color: '#FFFFFF',
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  rankItemMinPoints: {
    color: '#FFFFFF',
    fontSize: TYPOGRAPHY.sizes.xs,
    marginTop: SPACING.xs,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.sizes.base,
    textAlign: 'center',
    padding: SPACING.lg,
  },
  completedMission: {
    padding: SPACING.md,
    borderRadius: 8,
    backgroundColor: COLORS.backgroundAlt,
    marginBottom: SPACING.sm,
  },
  completedMissionName: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  completedMissionCategory: {
    fontSize: TYPOGRAPHY.sizes.sm,
    marginTop: SPACING.xs,
  },
});
