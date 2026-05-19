FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --only=production

COPY . .

RUN mkdir -p uploads/images uploads/audio uploads/gifs

EXPOSE 3000

CMD ["node", "src/index.js"]
