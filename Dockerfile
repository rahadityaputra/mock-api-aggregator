FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# ⚠️ Aman karena Prisma generate tidak connect DB
RUN npx prisma generate

CMD ["npm", "start"]