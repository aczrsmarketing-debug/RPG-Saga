import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';

import HomeScreen from './src/screens/HomeScreen';
import AIChatScreen from './src/screens/AIChatScreen';
import StatsScreen from './src/screens/StatsScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import MultiplayerScreen from './src/screens/MultiplayerScreen';

import { RPGCharacter, GameState } from './src/services/gameLogic';
import { storage } from './src/services/storage';
import { initializeNotifications, sendLevelUpNotification, sendRankChangeNotification } from './src/services/notifications';
import { COLORS } from './src/config/theme';

const Tab = createBottomTabNavigator();
const gameState = new GameState();

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [character, setCharacter] = useState(null);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Cargar preferencias
      const savedDarkMode = await storage.getDarkMode();
      if (savedDarkMode !== null) {
        setDarkMode(savedDarkMode);
      }

      // Cargar personaje
      const savedCharacter = await storage.loadCharacter();
      if (savedCharacter) {
        const char = new RPGCharacter(savedCharacter);
        gameState.loadCharacter(savedCharacter);
        setCharacter(char);
        
        // Verificar penalizaciones diarias
        char.checkDailyPenalties();
      } else {
        // Crear nuevo personaje
        const newChar = new RPGCharacter();
        gameState.loadCharacter(newChar.toJSON());
        setCharacter(newChar);
        await saveCharacter(newChar);
      }

      // Inicializar notificaciones
      await initializeNotifications();
    } catch (error) {
      console.error('Error initializing app:', error);
      // Crear personaje por defecto en caso de error
      const newChar = new RPGCharacter();
      setCharacter(newChar);
    } finally {
      setIsLoading(false);
    }
  };

  const saveCharacter = async (char) => {
    try {
      await storage.saveCharacter(char.toJSON());
    } catch (error) {
      console.error('Error saving character:', error);
    }
  };

  const handleCompleteTask = async (missionIndex, taskType, taskIndex) => {
    const oldLevel = character.level;
    const oldRank = character.rank;

    if (taskType === 'daily') {
      character.completeDailyTask(missionIndex, taskIndex);
    } else {
      character.completeWeeklyTask(missionIndex, taskIndex);
    }

    // Notificaciones de progreso
    if (character.level > oldLevel) {
      await sendLevelUpNotification(character.level);
    }
    
    if (character.rank !== oldRank) {
      const isPromotion = Object.keys(RANKS).indexOf(character.rank) > Object.keys(RANKS).indexOf(oldRank);
      await sendRankChangeNotification(character.rank, isPromotion);
    }

    setCharacter(new RPGCharacter(character.toJSON()));
    await saveCharacter(character);
  };

  const handleMissionGenerated = async (missionData) => {
    try {
      character.addMission(missionData);
      setCharacter(new RPGCharacter(character.toJSON()));
      await saveCharacter(character);
    } catch (error) {
      throw error;
    }
  };

  const handleToggleDarkMode = async (value) => {
    setDarkMode(value);
    await storage.saveDarkMode(value);
  };

  const handleUpdateCharacter = async (updates) => {
    Object.assign(character, updates);
    setCharacter(new RPGCharacter(character.toJSON()));
    await saveCharacter(character);
  };

  const handleLogout = async () => {
    await storage.clearAll();
    const newChar = new RPGCharacter();
    setCharacter(newChar);
    await saveCharacter(newChar);
  };

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: COLORS.background }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const theme = darkMode ? {
    dark: true,
    colors: {
      primary: COLORS.primary,
      background: COLORS.darkBg,
      card: COLORS.darkCard,
      text: COLORS.darkText,
      border: COLORS.border,
      notification: COLORS.danger,
    },
  } : {
    dark: false,
    colors: {
      primary: COLORS.primary,
      background: COLORS.background,
      card: COLORS.cardBg,
      text: COLORS.textPrimary,
      border: COLORS.border,
      notification: COLORS.danger,
    },
  };

  return (
    <>
      <StatusBar style={darkMode ? 'light' : 'dark'} />
      <NavigationContainer theme={theme}>
        <Tab.Navigator
          screenOptions={{
            tabBarStyle: {
              backgroundColor: darkMode ? COLORS.darkCard : COLORS.cardBg,
              borderTopColor: COLORS.border,
              borderTopWidth: 2,
              height: 60,
              paddingBottom: 8,
              paddingTop: 8,
            },
            tabBarActiveTintColor: COLORS.primary,
            tabBarInactiveTintColor: COLORS.secondary,
            tabBarLabelStyle: {
              fontSize: 10,
              fontWeight: '600',
            },
            headerStyle: {
              backgroundColor: darkMode ? COLORS.darkCard : COLORS.cardBg,
              borderBottomWidth: 2,
              borderBottomColor: COLORS.border,
            },
            headerTintColor: darkMode ? COLORS.darkText : COLORS.textPrimary,
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        >
          <Tab.Screen
            name="Misiones"
            options={{
              tabBarLabel: 'Misiones',
              tabBarIcon: () => null,
            }}
          >
            {() => (
              <HomeScreen
                character={character}
                onCompleteTask={handleCompleteTask}
                darkMode={darkMode}
              />
            )}
          </Tab.Screen>

          <Tab.Screen
            name="Chat IA"
            options={{
              tabBarLabel: 'Chat IA',
              tabBarIcon: () => null,
            }}
          >
            {() => (
              <AIChatScreen
                character={character}
                onMissionGenerated={handleMissionGenerated}
                darkMode={darkMode}
              />
            )}
          </Tab.Screen>

          <Tab.Screen
            name="Stats"
            options={{
              tabBarLabel: 'Stats',
              tabBarIcon: () => null,
            }}
          >
            {() => (
              <StatsScreen
                character={character}
                darkMode={darkMode}
              />
            )}
          </Tab.Screen>

          <Tab.Screen
            name="Competir"
            options={{
              tabBarLabel: 'Competir',
              tabBarIcon: () => null,
            }}
          >
            {() => (
              <MultiplayerScreen
                character={character}
                darkMode={darkMode}
              />
            )}
          </Tab.Screen>

          <Tab.Screen
            name="Perfil"
            options={{
              tabBarLabel: 'Perfil',
              tabBarIcon: () => null,
            }}
          >
            {() => (
              <ProfileScreen
                character={character}
                darkMode={darkMode}
                onToggleDarkMode={handleToggleDarkMode}
                onUpdateCharacter={handleUpdateCharacter}
                onLogout={handleLogout}
              />
            )}
          </Tab.Screen>
        </Tab.Navigator>
      </NavigationContainer>
    </>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
