import { RANKS, STATS_TYPES } from '../config/theme';

// Clase principal del personaje RPG
export class RPGCharacter {
  constructor(data = {}) {
    this.id = data.id || Date.now().toString();
    this.name = data.name || 'Hunter';
    this.level = data.level || 1;
    this.xp = data.xp || 0;
    this.totalPoints = data.totalPoints || 0;
    this.rank = data.rank || 'E';
    
    // Stats
    this.stats = {
      hp: data.stats?.hp || 100,
      maxHp: data.stats?.maxHp || 100,
      salud: data.stats?.salud || 0,
      mente: data.stats?.mente || 0,
      vida: data.stats?.vida || 0,
    };
    
    // Misiones activas (máximo 3)
    this.activeMissions = data.activeMissions || [];
    this.completedMissions = data.completedMissions || [];
    
    // Avatar
    this.avatar = data.avatar || null;
    
    // Timestamps
    this.createdAt = data.createdAt || Date.now();
    this.lastLogin = Date.now();
  }

  // Calcular XP necesario para siguiente nivel
  getXPForNextLevel() {
    return Math.floor(100 * Math.pow(1.5, this.level - 1));
  }

  // Ganar XP
  gainXP(amount, category) {
    this.xp += amount;
    this.totalPoints += amount;
    
    // Incrementar stat según categoría
    if (category === STATS_TYPES.SALUD) {
      this.stats.salud += amount;
    } else if (category === STATS_TYPES.MENTE) {
      this.stats.mente += amount;
    } else if (category === STATS_TYPES.VIDA) {
      this.stats.vida += amount;
    }
    
    // Checkear nivel up
    const xpNeeded = this.getXPForNextLevel();
    if (this.xp >= xpNeeded && this.level < 99) {
      this.levelUp();
    }
    
    // Actualizar rango
    this.updateRank();
  }

  // Subir de nivel
  levelUp() {
    this.level++;
    this.xp -= this.getXPForNextLevel();
    
    // Aumentar HP máximo
    this.stats.maxHp += 10;
    this.stats.hp = this.stats.maxHp; // Heal completo al subir nivel
  }

  // Actualizar rango basado en puntos totales
  updateRank() {
    const ranks = Object.entries(RANKS).reverse();
    for (const [rankKey, rankData] of ranks) {
      if (this.totalPoints >= rankData.minPoints) {
        this.rank = rankKey;
        break;
      }
    }
  }

  // Perder HP por fallar hábitos
  loseHP(amount) {
    this.stats.hp = Math.max(0, this.stats.hp - amount);
    
    // Si HP llega a 0, bajar rango
    if (this.stats.hp === 0) {
      this.penaltyRankDown();
      this.stats.hp = Math.floor(this.stats.maxHp * 0.5); // Recuperar 50%
    }
  }

  // Penalización: bajar rango
  penaltyRankDown() {
    const rankKeys = Object.keys(RANKS);
    const currentIndex = rankKeys.indexOf(this.rank);
    if (currentIndex > 0) {
      this.rank = rankKeys[currentIndex - 1];
      this.totalPoints = Math.max(0, this.totalPoints - 50);
    }
  }

  // Agregar misión activa
  addMission(mission) {
    if (this.activeMissions.length >= 3) {
      throw new Error('Ya tienes 3 misiones activas. Completa una antes de agregar más.');
    }
    
    // Verificar que no haya otra misión de la misma categoría
    const sameCategory = this.activeMissions.find(m => m.saga.category === mission.saga.category);
    if (sameCategory) {
      throw new Error(`Ya tienes una misión activa de ${mission.saga.category}`);
    }
    
    this.activeMissions.push({
      ...mission,
      startedAt: Date.now(),
      currentMissionIndex: 0,
      progress: {
        dailyCompleted: {},
        weeklyCompleted: {},
      },
    });
  }

  // Completar tarea diaria
  completeDailyTask(missionIndex, taskIndex) {
    const mission = this.activeMissions[missionIndex];
    if (!mission) return;
    
    const today = new Date().toISOString().split('T')[0];
    const currentMission = mission.missions[mission.currentMissionIndex];
    const task = currentMission.dailyTasks[taskIndex];
    
    if (!mission.progress.dailyCompleted[today]) {
      mission.progress.dailyCompleted[today] = [];
    }
    
    if (!mission.progress.dailyCompleted[today].includes(taskIndex)) {
      mission.progress.dailyCompleted[today].push(taskIndex);
      this.gainXP(task.xp, mission.saga.category);
    }
  }

  // Completar tarea semanal
  completeWeeklyTask(missionIndex, taskIndex) {
    const mission = this.activeMissions[missionIndex];
    if (!mission) return;
    
    const weekNum = Math.floor((Date.now() - mission.startedAt) / (7 * 24 * 60 * 60 * 1000));
    const currentMission = mission.missions[mission.currentMissionIndex];
    const task = currentMission.weeklyTasks[taskIndex];
    
    if (!mission.progress.weeklyCompleted[weekNum]) {
      mission.progress.weeklyCompleted[weekNum] = [];
    }
    
    if (!mission.progress.weeklyCompleted[weekNum].includes(taskIndex)) {
      mission.progress.weeklyCompleted[weekNum].push(taskIndex);
      this.gainXP(task.xp, mission.saga.category);
    }
  }

  // Verificar tareas no completadas y aplicar penalización
  checkDailyPenalties() {
    const today = new Date().toISOString().split('T')[0];
    
    this.activeMissions.forEach((mission) => {
      const currentMission = mission.missions[mission.currentMissionIndex];
      const completedToday = mission.progress.dailyCompleted[today] || [];
      
      if (completedToday.length < currentMission.dailyTasks.length) {
        // Falló completar todas las tareas del día
        this.loseHP(10 * (currentMission.dailyTasks.length - completedToday.length));
      }
    });
  }

  // Avanzar a siguiente misión (30 días)
  advanceMission(missionIndex) {
    const mission = this.activeMissions[missionIndex];
    if (!mission) return;
    
    mission.currentMissionIndex++;
    
    if (mission.currentMissionIndex >= mission.missions.length) {
      // Completó toda la saga
      this.completedMissions.push(mission);
      this.activeMissions.splice(missionIndex, 1);
    }
  }

  // Serializar para guardar
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      level: this.level,
      xp: this.xp,
      totalPoints: this.totalPoints,
      rank: this.rank,
      stats: this.stats,
      activeMissions: this.activeMissions,
      completedMissions: this.completedMissions,
      avatar: this.avatar,
      createdAt: this.createdAt,
      lastLogin: this.lastLogin,
    };
  }
}

// Estado global del juego
export class GameState {
  constructor() {
    this.character = null;
    this.darkMode = false;
    this.notifications = true;
    this.sharedSheetId = null;
  }

  loadCharacter(data) {
    this.character = new RPGCharacter(data);
  }

  saveToStorage() {
    if (!this.character) return;
    return this.character.toJSON();
  }
}
