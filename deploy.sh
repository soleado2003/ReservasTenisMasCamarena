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
sudo docker stop $(sudo docker ps -aq) || true
sudo docker rm $(sudo docker ps -aq) || true

# Remove all images
sudo docker rmi $(sudo docker images -aq) || true

# Remove all volumes
sudo docker volume rm $(sudo docker volume ls -q) || true

# Remove unused networks
sudo docker network prune -f || true

# Remove any dangling images, volumes, and networks
sudo docker system prune -af || true

echo "📦 Construyendo y desplegando servicios..."
# Build and start the services
sudo docker compose up -d --build

echo "✅ Despliegue completado."
echo "🚀 Accediendo a la aplicación..."