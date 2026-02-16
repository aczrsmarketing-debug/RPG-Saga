import axios from 'axios';

// Configuración de APIs
export const API_CONFIG = {
  // Claude API (Anthropic)
  CLAUDE_API_URL: 'https://api.anthropic.com/v1/messages',
  CLAUDE_API_KEY: '', // Usuario debe configurar su key
  CLAUDE_MODEL: 'claude-sonnet-4-20250514',
  
  // ChatGPT API (OpenAI) - alternativa
  OPENAI_API_URL: 'https://api.openai.com/v1/chat/completions',
  OPENAI_API_KEY: '', // Usuario debe configurar su key
  OPENAI_MODEL: 'gpt-4',
  
  // Google Sheets Backend
  SHEETS_API_URL: '', // Usuario debe configurar después de deploy Apps Script
};

// Cliente para Claude API
export const callClaudeAPI = async (userMessage, conversationHistory = []) => {
  try {
    const messages = [
      ...conversationHistory,
      { role: 'user', content: userMessage }
    ];

    const response = await axios.post(
      API_CONFIG.CLAUDE_API_URL,
      {
        model: API_CONFIG.CLAUDE_MODEL,
        max_tokens: 1000,
        messages: messages,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_CONFIG.CLAUDE_API_KEY,
          'anthropic-version': '2023-06-01',
        },
      }
    );

    return response.data.content[0].text;
  } catch (error) {
    console.error('Claude API Error:', error);
    throw error;
  }
};

// Cliente para ChatGPT API (alternativa)
export const callChatGPTAPI = async (userMessage, conversationHistory = []) => {
  try {
    const messages = [
      {
        role: 'system',
        content: 'Eres un asistente experto en crear misiones RPG de hábitos tipo Solo Leveling. Genera estructuras completas de Sagas (90 días) con 3 Misiones (30 días cada una) y tareas diarias/semanales.'
      },
      ...conversationHistory,
      { role: 'user', content: userMessage }
    ];

    const response = await axios.post(
      API_CONFIG.OPENAI_API_URL,
      {
        model: API_CONFIG.OPENAI_MODEL,
        messages: messages,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_CONFIG.OPENAI_API_KEY}`,
        },
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('ChatGPT API Error:', error);
    throw error;
  }
};

// Función para generar misión completa con IA
export const generateMissionWithAI = async (userInput, apiType = 'claude') => {
  const prompt = `
Genera una misión RPG de hábitos con esta estructura JSON exacta:

{
  "saga": {
    "name": "SAGA DE HÁBITO [nombre del hábito] – 90 días",
    "description": "Descripción narrativa épica del hábito",
    "category": "Salud|Mente|Vida"
  },
  "missions": [
    {
      "name": "M1: Fundación",
      "duration": 30,
      "description": "Establecer las bases",
      "dailyTasks": [
        {"name": "Tarea diaria 1", "xp": 10},
        {"name": "Tarea diaria 2", "xp": 10}
      ],
      "weeklyTasks": [
        {"name": "Reto semanal 1", "xp": 50}
      ]
    },
    {
      "name": "M2: Consistencia",
      "duration": 30,
      "description": "Mantener el ritmo",
      "dailyTasks": [
        {"name": "Tarea diaria 1", "xp": 15},
        {"name": "Tarea diaria 2", "xp": 15}
      ],
      "weeklyTasks": [
        {"name": "Reto semanal 1", "xp": 75}
      ]
    },
    {
      "name": "M3: Identidad",
      "duration": 30,
      "description": "Convertirse en la persona que tiene este hábito",
      "dailyTasks": [
        {"name": "Tarea diaria 1", "xp": 20},
        {"name": "Tarea diaria 2", "xp": 20}
      ],
      "weeklyTasks": [
        {"name": "Reto semanal 1", "xp": 100}
      ]
    }
  ]
}

Entrada del usuario: "${userInput}"

Genera SOLO el JSON, sin texto adicional.
`;

  const aiResponse = apiType === 'claude' 
    ? await callClaudeAPI(prompt)
    : await callChatGPTAPI(prompt);

  // Parsear respuesta de IA
  try {
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error('No se pudo parsear la respuesta de IA');
  } catch (error) {
    console.error('Error parsing AI response:', error);
    throw error;
  }
};

// Google Sheets API Functions
export const sheetsAPI = {
  // Guardar datos de usuario
  saveUserData: async (userData) => {
    try {
      const response = await axios.post(
        `${API_CONFIG.SHEETS_API_URL}?action=saveUser`,
        userData
      );
      return response.data;
    } catch (error) {
      console.error('Error saving user data:', error);
      throw error;
    }
  },

  // Obtener datos de usuario
  getUserData: async (userId) => {
    try {
      const response = await axios.get(
        `${API_CONFIG.SHEETS_API_URL}?action=getUser&userId=${userId}`
      );
      return response.data;
    } catch (error) {
      console.error('Error getting user data:', error);
      throw error;
    }
  },

  // Actualizar progreso
  updateProgress: async (userId, progressData) => {
    try {
      const response = await axios.post(
        `${API_CONFIG.SHEETS_API_URL}?action=updateProgress`,
        { userId, ...progressData }
      );
      return response.data;
    } catch (error) {
      console.error('Error updating progress:', error);
      throw error;
    }
  },

  // Obtener leaderboard
  getLeaderboard: async (sheetId) => {
    try {
      const response = await axios.get(
        `${API_CONFIG.SHEETS_API_URL}?action=getLeaderboard&sheetId=${sheetId}`
      );
      return response.data;
    } catch (error) {
      console.error('Error getting leaderboard:', error);
      throw error;
    }
  },
};
