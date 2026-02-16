# Assets para Saga de Hábitos

## Archivos Requeridos

Coloca los siguientes archivos en las carpetas correspondientes:

### /assets/
- `icon.png` - 1024x1024px - Ícono principal de la app
- `splash.png` - 1284x2778px - Splash screen (iPhone 13 Pro Max)
- `adaptive-icon.png` - 1024x1024px - Ícono adaptativo Android
- `favicon.png` - 48x48px - Favicon para web

### /public/icons/ (para PWA)
- `icon-192.png` - 192x192px - Ícono PWA pequeño
- `icon-512.png` - 512x512px - Ícono PWA grande

## Diseño Recomendado

### Concepto Visual
- **Estilo**: Minimalista, gaming, RPG
- **Colores**: Usar paleta de la app (#679CBC, #C11720, #FEF1D5)
- **Elementos**: 
  - Espada/arma (símbolo de misiones)
  - Escudo con letra "S" (Saga)
  - Estrellas de nivel/rango
  - Diseño limpio sin texto

### Herramientas para Crear Íconos

1. **Figma** (gratis): https://figma.com
2. **Canva** (gratis): https://canva.com
3. **GIMP** (gratis): https://gimp.org
4. **Adobe Illustrator** (pago)

### Templates Gratuitos
- https://www.appicon.co/
- https://makeappicon.com/
- https://icon.kitchen/

## Generación Rápida

Si no tienes diseños, puedes usar placeholders temporales:

```bash
# Crear placeholders simples (requiere ImageMagick)
convert -size 1024x1024 xc:#679CBC -gravity center -pointsize 200 -annotate +0+0 "SH" assets/icon.png
convert -size 1284x2778 xc:#FEF1D5 -gravity center -pointsize 100 -annotate +0+0 "Saga de Hábitos" assets/splash.png
convert assets/icon.png -resize 192x192 public/icons/icon-192.png
convert assets/icon.png -resize 512x512 public/icons/icon-512.png
convert assets/icon.png -resize 48x48 assets/favicon.png
```

## Validación

Una vez agregados los assets:

1. **Expo**: `expo start` - verifica que carguen en la app
2. **PWA**: Usa https://www.pwabuilder.com/ para validar
3. **iOS**: Verifica en Xcode que se vean bien
4. **Android**: Verifica en Android Studio

## Notas Importantes

- Todos los íconos deben tener fondo sólido (no transparente para splash)
- Los adaptive icons en Android pueden tener transparencia
- Mantén elementos importantes en el "safe area" (centro 80%)
- Prueba en diferentes tamaños para asegurar legibilidad

---

**Tip**: El ícono es la primera impresión de tu app. ¡Invierte tiempo en hacerlo bien!
