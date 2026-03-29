FROM node:20-alpine
WORKDIR /app
COPY laposte/package*.json ./laposte/
WORKDIR /app/laposte
RUN npm install
COPY laposte/ .
RUN npm run build
EXPOSE 3003
CMD ["npm", "start"]
