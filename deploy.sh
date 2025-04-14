#!/bin/bash

# Ensure script exits on any error
set -e

echo "🧼 Borrando frontend antiguo..."
cd ReservasMC
rm -rf dist
npm install
npm run build
cd ..

echo "🧹 Limpiando contenedores existentes..."
# Stop and remove all containers
sudo docker compose down || true

# Remove any dangling images, volumes, and networks
sudo docker system prune -af || true

echo "📦 Construyendo y desplegando servicios..."
# Build and start the services
sudo docker compose up -d --build

echo "✅ Despliegue completado."
echo "🚀 Accediendo a la aplicación..."