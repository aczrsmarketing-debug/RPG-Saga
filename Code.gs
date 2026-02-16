// Google Apps Script para Backend de Saga de Hábitos
// Deployment: Extensions > Apps Script > Deploy > New Deployment > Web App

/**
 * INSTRUCCIONES DE CONFIGURACIÓN:
 * 1. Crea un nuevo Google Sheet
 * 2. Ve a Extensions > Apps Script
 * 3. Pega este código
 * 4. Deploy como Web App (acceso: Anyone)
 * 5. Copia el URL del deployment y úsalo en la app
 * 
 * El Sheet tendrá estas hojas:
 * - Users: Datos de usuarios
 * - Progress: Historial de progreso
 * - Leaderboard: Clasificación compartida
 */

// Configuración
const SHEET_NAME_USERS = 'Users';
const SHEET_NAME_PROGRESS = 'Progress';
const SHEET_NAME_LEADERBOARD = 'Leaderboard';

// Crear hojas si no existen
function setupSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Users sheet
  if (!ss.getSheetByName(SHEET_NAME_USERS)) {
    const usersSheet = ss.insertSheet(SHEET_NAME_USERS);
    usersSheet.getRange('A1:J1').setValues([[
      'User ID', 'Name', 'Level', 'Rank', 'Total Points', 
      'Salud', 'Mente', 'Vida', 'Avatar', 'Last Update'
    ]]);
  }
  
  // Progress sheet
  if (!ss.getSheetByName(SHEET_NAME_PROGRESS)) {
    const progressSheet = ss.insertSheet(SHEET_NAME_PROGRESS);
    progressSheet.getRange('A1:E1').setValues([[
      'User ID', 'Date', 'XP Gained', 'Category', 'Mission'
    ]]);
  }
  
  // Leaderboard sheet
  if (!ss.getSheetByName(SHEET_NAME_LEADERBOARD)) {
    const leaderboardSheet = ss.insertSheet(SHEET_NAME_LEADERBOARD);
    leaderboardSheet.getRange('A1:F1').setValues([[
      'User ID', 'Name', 'Rank', 'Level', 'Total Points', 'Avatar'
    ]]);
  }
}

// Endpoint principal
function doGet(e) {
  setupSheets();
  
  const action = e.parameter.action;
  const userId = e.parameter.userId;
  const sheetId = e.parameter.sheetId;
  
  let result = {};
  
  try {
    switch(action) {
      case 'getUser':
        result = getUser(userId);
        break;
      case 'getLeaderboard':
        result = getLeaderboard(sheetId);
        break;
      default:
        result = { error: 'Invalid action' };
    }
  } catch (error) {
    result = { error: error.toString() };
  }
  
  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  setupSheets();
  
  const action = e.parameter.action;
  const data = JSON.parse(e.postData.contents);
  
  let result = {};
  
  try {
    switch(action) {
      case 'saveUser':
        result = saveUser(data);
        break;
      case 'updateProgress':
        result = updateProgress(data);
        break;
      default:
        result = { error: 'Invalid action' };
    }
  } catch (error) {
    result = { error: error.toString() };
  }
  
  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

// Guardar usuario
function saveUser(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const usersSheet = ss.getSheetByName(SHEET_NAME_USERS);
  const leaderboardSheet = ss.getSheetByName(SHEET_NAME_LEADERBOARD);
  
  const userId = data.userId;
  const userRow = findRowByUserId(usersSheet, userId);
  const timestamp = new Date().toISOString();
  
  const userData = [
    userId,
    data.name,
    data.level,
    data.rank,
    data.totalPoints,
    data.stats.salud,
    data.stats.mente,
    data.stats.vida,
    data.avatar || '',
    timestamp
  ];
  
  if (userRow > 0) {
    // Update existing user
    usersSheet.getRange(userRow, 1, 1, userData.length).setValues([userData]);
  } else {
    // New user
    usersSheet.appendRow(userData);
  }
  
  // Update leaderboard
  updateLeaderboard(data);
  
  return { success: true, userId: userId };
}

// Obtener usuario
function getUser(userId) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const usersSheet = ss.getSheetByName(SHEET_NAME_USERS);
  
  const userRow = findRowByUserId(usersSheet, userId);
  
  if (userRow < 0) {
    return { error: 'User not found' };
  }
  
  const data = usersSheet.getRange(userRow, 1, 1, 10).getValues()[0];
  
  return {
    userId: data[0],
    name: data[1],
    level: data[2],
    rank: data[3],
    totalPoints: data[4],
    stats: {
      salud: data[5],
      mente: data[6],
      vida: data[7],
    },
    avatar: data[8],
    lastUpdate: data[9],
  };
}

// Actualizar progreso
function updateProgress(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const progressSheet = ss.getSheetByName(SHEET_NAME_PROGRESS);
  
  const timestamp = new Date().toISOString();
  
  progressSheet.appendRow([
    data.userId,
    timestamp,
    data.xpGained,
    data.category,
    data.mission || '',
  ]);
  
  return { success: true };
}

// Actualizar leaderboard
function updateLeaderboard(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const leaderboardSheet = ss.getSheetByName(SHEET_NAME_LEADERBOARD);
  
  const userId = data.userId;
  const leaderboardRow = findRowByUserId(leaderboardSheet, userId);
  
  const leaderboardData = [
    userId,
    data.name,
    data.rank,
    data.level,
    data.totalPoints,
    data.avatar || '',
  ];
  
  if (leaderboardRow > 0) {
    leaderboardSheet.getRange(leaderboardRow, 1, 1, leaderboardData.length).setValues([leaderboardData]);
  } else {
    leaderboardSheet.appendRow(leaderboardData);
  }
}

// Obtener leaderboard
function getLeaderboard(sheetId) {
  // Si sheetId está presente, usar ese sheet específico
  // De lo contrario, usar el sheet actual
  const ss = sheetId 
    ? SpreadsheetApp.openById(sheetId)
    : SpreadsheetApp.getActiveSpreadsheet();
  
  const leaderboardSheet = ss.getSheetByName(SHEET_NAME_LEADERBOARD);
  
  if (!leaderboardSheet) {
    return [];
  }
  
  const data = leaderboardSheet.getDataRange().getValues();
  
  // Skip header row
  const players = data.slice(1).map(row => ({
    userId: row[0],
    name: row[1],
    rank: row[2],
    level: row[3],
    totalPoints: row[4],
    avatar: row[5],
  }));
  
  // Sort by total points
  players.sort((a, b) => b.totalPoints - a.totalPoints);
  
  return players;
}

// Helper: Encontrar fila por User ID
function findRowByUserId(sheet, userId) {
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === userId) {
      return i + 1; // +1 porque getRange usa 1-indexed
    }
  }
  
  return -1;
}

// Test function
function testAPI() {
  setupSheets();
  
  const testData = {
    userId: 'test123',
    name: 'Test Hunter',
    level: 5,
    rank: 'D',
    totalPoints: 250,
    stats: {
      salud: 100,
      mente: 80,
      vida: 70,
    },
    avatar: '',
  };
  
  const result = saveUser(testData);
  Logger.log(result);
  
  const leaderboard = getLeaderboard();
  Logger.log(leaderboard);
}
