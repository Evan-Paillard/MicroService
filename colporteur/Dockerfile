FROM node:20-alpine
WORKDIR /app
COPY colporteur/package*.json ./colporteur/
COPY mi8/proto/ ./mi8/proto/
WORKDIR /app/colporteur
RUN npm install
COPY colporteur/ .
RUN npm run build
CMD ["npm", "start"]
