FROM node:20-alpine
WORKDIR /app
COPY mi8/package*.json ./mi8/
WORKDIR /app/mi8
RUN npm install
COPY mi8/ .
RUN npm run build
CMD ["npm", "start"]
