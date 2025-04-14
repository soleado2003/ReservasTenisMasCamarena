echo "🧼 Borrando frontend antiguo..."
cd ReservasMC
rm -rf dist
npm install
npm run build
cd ..

echo "🧹 Limpiando contenedores existentes..."
sudo docker compose down --remove-orphans

echo "📦 Construyendo y desplegando servicios..."
sudo ocker compose up -d --build

echo "✅ Despliegue completado."


echo "🚀 Accediendo a la aplicación..."