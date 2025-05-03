#!/bin/bash
set -e

echo "🧼 Borrando frontend antiguo..."
cd ReservasMC
rm -rf dist

echo "🔨 Construyendo frontend en contenedor Node…"
docker run --rm \
  -u "$(id -u):$(id -g)" \
  -v "$PWD":/app \
  -w /app \
  node:18-alpine \
  sh -c "npm install && npm run build"

cd ..

echo "🧹 Limpiando contenedores existentes..."
sudo docker compose down --remove-orphans

echo "📦 Construyendo y desplegando servicios..."
sudo docker compose up -d --build

echo "✅ Despliegue completado."
