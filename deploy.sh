echo "🧼 Borrando frontend antiguo..."
cd ReservasMC
rm -rf dist
npm install
npm run build
cd ..

echo "🐳 Levantando contenedores actualizados..."
docker compose up -d --build

echo "✅ Despliegue completado."
