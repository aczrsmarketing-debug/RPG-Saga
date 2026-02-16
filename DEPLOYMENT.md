# 🚀 Guía de Deployment a GitHub Pages

## Prerequisitos
- Cuenta de GitHub
- Repositorio creado

## Paso 1: Preparar el Proyecto

```bash
# En la raíz del proyecto
npm install
```

## Paso 2: Build para Web

```bash
# Generar build de producción
expo export:web

# Esto crea la carpeta /web-build con todos los archivos estáticos
```

## Paso 3: Configurar para GitHub Pages

### Opción A: Usar carpeta /docs (Recomendado)

```bash
# Crear carpeta docs si no existe
mkdir -p docs

# Copiar contenido de web-build a docs
cp -r web-build/* docs/

# Agregar archivos al git
git add docs/
git commit -m "Deploy to GitHub Pages"
git push
```

### Opción B: Branch gh-pages

```bash
# Crear branch gh-pages
git checkout -b gh-pages

# Copiar web-build a root
cp -r web-build/* .

# Commit y push
git add .
git commit -m "Deploy to GitHub Pages"
git push origin gh-pages

# Volver a main
git checkout main
```

## Paso 4: Configurar GitHub Pages

1. Ve a tu repositorio en GitHub
2. Click en **Settings**
3. En el menú lateral, click en **Pages**
4. En "Source":
   - **Opción A**: Branch: `main`, Folder: `/docs`
   - **Opción B**: Branch: `gh-pages`, Folder: `/root`
5. Click **Save**

## Paso 5: Esperar Deploy

- GitHub Pages tomará unos minutos en deployar
- Tu app estará disponible en: `https://<username>.github.io/<repo-name>`

## Paso 6: Verificar PWA

1. Abre la URL en Chrome/Edge móvil
2. Deberías ver el prompt para "Agregar a pantalla de inicio"
3. Verifica que funcione offline (modo avión)

## Actualizaciones Futuras

```bash
# Cada vez que quieras actualizar:

# 1. Hacer cambios en el código
# 2. Build nuevo
expo export:web

# 3. Copiar a docs
cp -r web-build/* docs/

# 4. Commit y push
git add docs/
git commit -m "Update app"
git push
```

## Troubleshooting

### La página muestra 404
- Verifica que el source esté correctamente configurado
- Espera 5-10 minutos después del primer deploy
- Revisa que los archivos estén en la carpeta correcta

### Assets no cargan
- Verifica que manifest.json tenga las rutas correctas
- Asegúrate que los íconos estén en /docs/public/

### Service Worker no funciona
- GitHub Pages usa HTTPS automáticamente (requerido para PWA)
- Verifica en DevTools > Application > Service Workers
- Haz hard refresh (Ctrl+Shift+R)

### PWA no se puede instalar
- Solo funciona en HTTPS (GitHub Pages lo tiene)
- Verifica que manifest.json sea válido
- Usa Lighthouse en DevTools para verificar PWA score

## Custom Domain (Opcional)

Si tienes un dominio propio:

1. En GitHub Pages settings, agrega tu custom domain
2. Crea un archivo CNAME en /docs/:
```
tudominio.com
```
3. Configura DNS de tu dominio:
   - Type: CNAME
   - Name: www
   - Value: username.github.io

## Script Automatizado

Puedes usar este script para automatizar el deployment:

```bash
#!/bin/bash

echo "🔨 Building app..."
expo export:web

echo "📦 Copying to docs..."
rm -rf docs/*
cp -r web-build/* docs/

echo "📤 Deploying to GitHub..."
git add docs/
git commit -m "Deploy: $(date +%Y-%m-%d-%H:%M:%S)"
git push

echo "✅ Deployment complete!"
echo "🌐 Visit: https://<username>.github.io/<repo>"
```

Guárdalo como `deploy.sh` y hazlo ejecutable:
```bash
chmod +x deploy.sh
./deploy.sh
```

---

**¡Tu app estará live en minutos! 🎉**
