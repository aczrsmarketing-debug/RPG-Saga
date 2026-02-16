# 🎮 Saga de Hábitos

RPG Habit Tracker con gamificación tipo Solo Leveling. Cross-platform (Android, iOS, Web) con PWA support.

## 🌟 Características

### Core RPG
- **Sistema de Niveles**: Nivel 1-99 con XP por tareas completadas
- **Sistema de Rangos**: E → D → C → B → A → S (sube/baja automáticamente)
- **Stats**: Salud, Mente, Vida (incrementan por categoría de hábito)
- **HP System**: Pierdes HP si fallas hábitos, bajas de rango si llega a 0

### Misiones
- **Estructura 90 días**: Saga completa dividida en 3 misiones de 30 días
  1. M1: Fundación - Establecer bases
  2. M2: Consistencia - Mantener ritmo
  3. M3: Identidad - Convertirse en la persona que tiene el hábito
- **Máximo 3 misiones activas**: Una por categoría (Salud, Mente, Vida)
- **Tareas diarias y semanales**: Núcleo del hábito con XP progresivo

### Generación con IA
- Integración con **Claude API** (Anthropic) y **ChatGPT API** (OpenAI)
- Chat conversacional para crear misiones personalizadas
- Estructura automática completa (Saga + 3 Misiones + Tareas)

### Multiplayer
- **Leaderboard compartido**: Compite con amigos/familia
- **Google Sheets backend**: Sync en tiempo real
- **Invitaciones por link**: Genera enlaces para unirse
- **Comparación de stats**: Ve tu progreso vs otros

### Features Técnicas
- **Notificaciones push**: Recordatorios mañana/tarde
- **Login biométrico**: Huella digital / Face ID
- **Gráficos de progreso**: Charts por habilidad
- **Dark mode**: Soporte tema oscuro
- **PWA**: Instalable en móvil/web, offline-first
- **Cross-platform**: React Native (Android/iOS) + Web

## 🚀 Setup Rápido

### 1. Requisitos
- Node.js 16+
- Expo CLI (`npm install -g expo-cli`)
- Cuenta Anthropic o OpenAI (para IA)
- Google Account (para backend multiplayer)

### 2. Instalación

```bash
# Clonar repositorio
git clone <your-repo>
cd saga-habitos

# Instalar dependencias
npm install

# Iniciar en desarrollo
expo start

# Para Android
expo start --android

# Para iOS
expo start --ios

# Para Web
expo start --web
```

### 3. Configurar APIs

#### 3.1 Claude/ChatGPT API
1. Obtén tu API key:
   - **Claude**: https://console.anthropic.com/
   - **ChatGPT**: https://platform.openai.com/
2. En la app, ve a **Perfil > Configuración de IA**
3. Pega tu API key

#### 3.2 Google Sheets Backend
1. Crea un nuevo Google Sheet
2. Ve a **Extensions > Apps Script**
3. Copia el código de `/google-apps-script/Code.gs`
4. Deploy como **Web App**:
   - Click "Deploy" > "New deployment"
   - Type: Web app
   - Execute as: Me
   - Who has access: **Anyone**
5. Copia el URL del deployment
6. En la app, ve a **Perfil > Configuración de IA**
7. Pega la URL en "Google Sheets URL"

### 4. Build para Producción

#### Web (PWA)
```bash
# Build
expo export:web

# Archivos generados en /web-build

# Deploy a GitHub Pages
# 1. Crea carpeta /docs en root
# 2. Copia contenido de /web-build a /docs
npm run deploy

# 3. En GitHub: Settings > Pages > Source: main branch /docs folder
```

#### Android
```bash
# Generar APK
eas build --platform android

# O usa Expo Go para testing
```

#### iOS
```bash
# Requiere macOS y cuenta Apple Developer
eas build --platform ios
```

## 📱 Uso de la App

### Crear tu Primer Hábito
1. Ve a **Chat IA**
2. Escribe algo como: "Quiero ir al gym 5 veces por semana"
3. La IA generará una saga completa de 90 días
4. Click en **✓ Activar Misión**
5. Ve a **Misiones** para ver tus tareas del día

### Completar Tareas
- En **Misiones**, marca cada tarea diaria
- Ganas XP y subes nivel/rango
- Completa también los retos semanales

### Competir con Amigos
1. Ve a **Competir**
2. Configura un Google Sheet ID (mismo para todo el grupo)
3. Click **Invitar** para generar link
4. Comparte el link con amigos
5. Todos verán el leaderboard actualizado

## 🎨 Diseño

### Paleta de Colores (HEX)
- **Fondos**: `#FEF1D5`, `#E0E0E0`
- **Gráficos**: `#679CBC`, `#A38560`
- **Detalles**: `#C11720`, `#0C324A`, `#16302B`, `#390517`, `#03110D`

### Tipografía
- **Family**: System Sans-serif
- **Tamaños mínimos**: 10pt
- **Pesos**: Regular, Medium, Semibold, Bold

### UI Principles
- Minimalista y limpio
- Cards simples con bordes
- Botones grandes y claros
- Íconos con labels de texto
- Dark mode opcional

## 📊 Estructura del Proyecto

```
saga-habitos/
├── App.js                      # Entry point
├── src/
│   ├── config/
│   │   └── theme.js           # Colores, tipografía, constantes
│   ├── services/
│   │   ├── api.js             # Claude/ChatGPT/Sheets API
│   │   ├── gameLogic.js       # RPG mechanics
│   │   ├── notifications.js   # Push notifications
│   │   └── storage.js         # Local storage
│   └── screens/
│       ├── HomeScreen.js      # Misiones activas
│       ├── AIChatScreen.js    # Generar con IA
│       ├── StatsScreen.js     # Gráficos progreso
│       ├── ProfileScreen.js   # Avatar y config
│       └── MultiplayerScreen.js # Leaderboard
├── public/
│   ├── manifest.json          # PWA manifest
│   └── service-worker.js      # Offline support
├── google-apps-script/
│   └── Code.gs                # Backend Google Sheets
└── package.json
```

## 🔧 Troubleshooting

### "No se pudo generar la misión"
- Verifica que tu API key esté correctamente configurada
- Revisa que tengas créditos en tu cuenta Anthropic/OpenAI
- Intenta con el otro proveedor (Claude ↔ ChatGPT)

### "Error al sincronizar datos"
- Verifica la URL de Google Apps Script
- Asegúrate que el deployment está como "Anyone" can access
- Revisa que el Sheet tenga las hojas correctas (Users, Progress, Leaderboard)

### Notificaciones no llegan
- En Android: Verifica permisos en Settings
- En iOS: Acepta el prompt de notificaciones
- Solo funcionan en dispositivos físicos, no en emulador

### PWA no se instala
- Usa HTTPS (GitHub Pages lo hace automático)
- Verifica que manifest.json esté accesible
- Prueba en Chrome/Edge móvil

## 📄 Licencia

MIT License - Uso libre para proyectos personales y comerciales

## 🙏 Créditos

- **Gamificación inspirada en**: Solo Leveling
- **APIs**: Anthropic Claude, OpenAI ChatGPT
- **Backend**: Google Apps Script
- **Framework**: React Native + Expo

---

**¡Comienza tu saga épica hoy! 🎯**
