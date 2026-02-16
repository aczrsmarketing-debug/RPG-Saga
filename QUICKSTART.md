# ⚡ Quick Start - Saga de Hábitos

## 🚀 Empezar en 5 Minutos

### 1. Instalar
```bash
npm install
expo start
```

### 2. Abrir App
- **Android**: Escanea QR con Expo Go
- **iOS**: Escanea QR con cámara
- **Web**: Presiona `w` en terminal

### 3. Configurar IA (Opcional pero recomendado)
1. Abre la app
2. Ve a **Perfil** (última pestaña)
3. Scroll a "Configuración de IA"
4. Pega tu Claude o ChatGPT API key

**¿Dónde obtener keys?**
- Claude: https://console.anthropic.com/
- ChatGPT: https://platform.openai.com/

### 4. Crear tu Primera Misión
1. Ve a **Chat IA** (segunda pestaña)
2. Escribe: "Quiero hacer ejercicio 30 min diarios"
3. La IA generará tu saga de 90 días
4. Click **✓ Activar Misión**
5. ¡Listo! Ve a **Misiones** para empezar

## 🎮 Uso Básico

### Completar Tareas
- Marca cada tarea diaria en **Misiones**
- Ganas XP y subes de nivel
- Completa retos semanales para bonus

### Ver Progreso
- **Stats** muestra tus gráficos y rangos
- Tu nivel sube de 1 a 99
- Tu rango sube de E a S

### Competir
1. Ve a **Competir**
2. Configura Google Sheet (ver CONFIG.md)
3. Invita amigos con el link
4. ¡Compite en el leaderboard!

## 📱 Deploy a Producción

### Web (GitHub Pages)
```bash
# Build
expo export:web

# Copiar a docs/
mkdir -p docs
cp -r web-build/* docs/

# Push a GitHub
git add docs/
git commit -m "Deploy PWA"
git push

# Configurar en GitHub > Settings > Pages > Source: /docs
```

Tu app estará en: `https://tu-usuario.github.io/tu-repo`

### Android APK
```bash
# Requiere cuenta Expo
eas build --platform android
```

### iOS
```bash
# Requiere macOS + Apple Developer
eas build --platform ios
```

## 🔧 Estructura del Proyecto

```
saga-habitos/
├── App.js                    # ← Entry point
├── src/
│   ├── screens/             # ← Pantallas (Home, Chat, Stats, etc)
│   ├── services/            # ← Lógica (API, RPG, Storage)
│   └── config/              # ← Tema y constantes
├── public/                   # ← PWA files
└── google-apps-script/      # ← Backend Google Sheets
```

## 📚 Documentación Completa

- **README.md** - Guía completa con todas las features
- **CONFIG.md** - Configuración detallada de APIs
- **DEPLOYMENT.md** - Deploy paso a paso
- **assets/README.md** - Crear íconos

## 🆘 Problemas Comunes

**"No puedo generar misiones"**
→ Configura tu API key en Perfil

**"Notificaciones no llegan"**
→ Solo funcionan en dispositivos físicos, habilita permisos

**"No veo el leaderboard"**
→ Configura Google Sheets backend (ver CONFIG.md)

## 💡 Tips

- **Usa Chat IA** para generar misiones variadas
- **Completa tareas diarias** para mantener tu HP
- **Retos semanales** dan mucho más XP
- **Compite con amigos** para más motivación
- **Dark mode** en Perfil > Preferencias

## 🎯 Siguiente Paso

¡Abre la app y crea tu primera Saga! 🚀

---

**¿Necesitas ayuda?** Lee README.md o revisa CONFIG.md
