echo "🧼 Borrando frontend antiguo..."
cd ReservasMC
rm -rf dist
npm install
npm run build
cd ..

echo "🧹 Limpiando contenedores existentes..."
docker compose down --remove-orphans

echo "📦 Construyendo y desplegando servicios..."
docker compose up -d --build

echo "✅ Despliegue completado."
