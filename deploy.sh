#!/bin/bash
set -e

echo "🧹 Limpiando contenedores existentes..."
sudo docker compose down --remove-orphans

echo "📦 Construyendo y desplegando servicios..."
sudo docker compose up -d --build

echo "✅ Despliegue completado."