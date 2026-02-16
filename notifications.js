import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

// Configurar comportamiento de notificaciones
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Registrar para notificaciones push
export async function registerForPushNotifications() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#C11720',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      alert('No se pudieron obtener permisos para notificaciones');
      return;
    }
    
    token = (await Notifications.getExpoPushTokenAsync()).data;
  } else {
    alert('Debes usar un dispositivo físico para notificaciones push');
  }

  return token;
}

// Programar notificación matutina (8:00 AM)
export async function scheduleMorningNotification() {
  await Notifications.cancelAllScheduledNotificationsAsync();
  
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '⚔️ Nuevas Misiones Disponibles',
      body: 'Hunter, tus tareas diarias te esperan. ¡Completa tu saga!',
      data: { type: 'daily_reminder' },
    },
    trigger: {
      hour: 8,
      minute: 0,
      repeats: true,
    },
  });
}

// Programar notificación vespertina (8:00 PM)
export async function scheduleEveningNotification() {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '⚠️ Misiones Pendientes',
      body: 'Aún tienes tareas sin completar. ¡No pierdas HP!',
      data: { type: 'evening_reminder' },
    },
    trigger: {
      hour: 20,
      minute: 0,
      repeats: true,
    },
  });
}

// Notificación de nivel up
export async function sendLevelUpNotification(newLevel) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '🎉 ¡NIVEL SUPERIOR!',
      body: `¡Has alcanzado el nivel ${newLevel}! HP restaurado.`,
      data: { type: 'level_up', level: newLevel },
    },
    trigger: null, // Inmediata
  });
}

// Notificación de cambio de rango
export async function sendRankChangeNotification(newRank, isPromotion) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: isPromotion ? `📈 ¡ASCENSO A RANGO ${newRank}!` : `📉 Rango Reducido a ${newRank}`,
      body: isPromotion 
        ? `¡Felicidades! Has ascendido al rango ${newRank}.`
        : `Has descendido al rango ${newRank}. ¡Recupérate!`,
      data: { type: 'rank_change', rank: newRank, isPromotion },
    },
    trigger: null,
  });
}

// Notificación de HP bajo
export async function sendLowHPNotification(currentHP, maxHP) {
  if (currentHP <= maxHP * 0.3) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '💀 ¡HP CRÍTICO!',
        body: `Tu HP está en ${currentHP}/${maxHP}. ¡Completa tus hábitos!`,
        data: { type: 'low_hp', hp: currentHP },
      },
      trigger: null,
    });
  }
}

// Inicializar sistema de notificaciones
export async function initializeNotifications() {
  try {
    await registerForPushNotifications();
    await scheduleMorningNotification();
    await scheduleEveningNotification();
  } catch (error) {
    console.error('Error initializing notifications:', error);
  }
}
