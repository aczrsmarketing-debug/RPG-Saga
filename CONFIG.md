# Configuración de Ejemplo - Saga de Hábitos

## API Keys

### Claude API (Anthropic)
1. Ve a https://console.anthropic.com/
2. Crea una cuenta o inicia sesión
3. Ve a "API Keys"
4. Genera una nueva key
5. Copia y pega en la app en: Perfil > Configuración de IA

Formato: `sk-ant-api03-...`

### ChatGPT API (OpenAI)
1. Ve a https://platform.openai.com/
2. Crea una cuenta o inicia sesión
3. Ve a "API Keys"
4. Genera una nueva key
5. Copia y pega en la app en: Perfil > Configuración de IA

Formato: `sk-...`

**IMPORTANTE**: Estas keys son secretas. NUNCA las compartas o las subas a GitHub.

## Google Sheets Backend

### Setup Inicial
1. Crea un nuevo Google Sheet
2. Nombra el sheet como quieras (ej: "Saga Habitos DB")
3. Ve a Extensions > Apps Script
4. Borra el código por defecto
5. Copia el código de `/google-apps-script/Code.gs`
6. Click en "Deploy" > "New deployment"
7. Configuración:
   - Type: Web app
   - Description: Saga Habitos API
   - Execute as: Me
   - Who has access: **Anyone**
8. Click "Deploy"
9. Autoriza los permisos cuando se solicite
10. Copia la URL del deployment (Web app URL)
11. Pega en la app en: Perfil > Configuración de IA > Google Sheets URL

### Estructura del Sheet
El script creará automáticamente 3 hojas:

**Users**
- User ID, Name, Level, Rank, Total Points, Salud, Mente, Vida, Avatar, Last Update

**Progress**
- User ID, Date, XP Gained, Category, Mission

**Leaderboard**
- User ID, Name, Rank, Level, Total Points, Avatar

### Compartir con Grupo
1. En la app, ve a Competir
2. Encuentra el Sheet ID (está en la URL del Google Sheet)
   - Ejemplo URL: `https://docs.google.com/spreadsheets/d/1A2B3C4D5E6F/edit`
   - Sheet ID: `1A2B3C4D5E6F`
3. Pega el Sheet ID en "Google Sheet ID"
4. Click "Guardar"
5. Click "Invitar" para generar link
6. Comparte el link con amigos/familia

Todos los que usen el mismo Sheet ID verán el mismo leaderboard.

## Notificaciones

### Android
Las notificaciones están habilitadas por defecto. Si no funcionan:
1. Ve a Settings del sistema > Apps > Saga de Hábitos
2. Habilita notificaciones
3. Permitir notificaciones en primer plano

### iOS
1. Cuando la app solicite permisos, click "Allow"
2. Si denegaste, ve a Settings > Notifications > Saga de Hábitos
3. Habilita "Allow Notifications"

### Web (PWA)
Las notificaciones push en web requieren:
1. HTTPS (GitHub Pages lo tiene automáticamente)
2. Service Worker registrado
3. Permiso del navegador (se solicita automáticamente)

## Biometría

### Android
Requiere:
- Sensor de huella digital configurado en el dispositivo
- O Face Unlock configurado

### iOS
Requiere:
- Touch ID o Face ID configurado

Si no está configurado, la app te pedirá que lo hagas en Settings del sistema.

## Dark Mode

Se activa/desactiva en: Perfil > Preferencias > Modo Oscuro

La preferencia se guarda localmente en el dispositivo.

## Troubleshooting

### "No se pudo generar la misión"
- ✓ API key configurada correctamente
- ✓ Créditos disponibles en cuenta Anthropic/OpenAI
- ✓ Conexión a internet activa

### "Error al sincronizar"
- ✓ URL de Google Apps Script correcta
- ✓ Deployment configurado como "Anyone"
- ✓ Permisos autorizados en Google

### "Notificaciones no llegan"
- ✓ Permisos habilitados
- ✓ Dispositivo físico (no emulador)
- ✓ App en primer plano al menos una vez

---

**Si tienes problemas, revisa el README.md completo.**
