# Imagen base Alpine (≈ 80 MB)
FROM node:18-alpine

# Directorio de trabajo
WORKDIR /app

# Sólo deps de producción
ENV NODE_ENV=production

# Copiamos el package.json y package-lock.json
COPY package*.json ./

# Instalamos únicamente las deps de prod
RUN npm install

# Copiamos el resto del código
COPY . .

# Exponemos el puerto
EXPOSE 3010

# Arranque de la aplicación
CMD ["node", "app.js"]