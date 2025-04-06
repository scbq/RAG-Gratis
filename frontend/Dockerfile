# frontend/Dockerfile

FROM node:18-alpine

WORKDIR /app

# Asegúrate de no copiar package-lock.json ni node_modules
COPY package.json ./
RUN npm install

# Ahora sí copiamos el resto
COPY . .

RUN npm run build

EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host"]
