echo "🧼 Borrando frontend antiguo..."
cd ReservasMC
rm -rf dist
npm install
npm run build
cd ..

echo "🧹 Limpiando contenedores existentes..."
# Force stop any running containers
sudo docker compose kill || true
# Remove containers and networks
sudo docker compose down --remove-orphans || true
# Remove any dangling containers
sudo docker system prune -f

echo "📦 Construyendo y desplegando servicios..."
sudo docker compose up -d --build

echo "✅ Despliegue completado."

echo "🚀 Accediendo a la aplicación..."