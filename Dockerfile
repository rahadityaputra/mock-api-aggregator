FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# DATABASE_URL dummy diperlukan agar prisma.config.ts bisa di-load saat build.
# prisma generate tidak perlu koneksi DB nyata, hanya butuh schema.
ARG DATABASE_URL=mysql://dummy:dummy@localhost:3306/dummy
ENV DATABASE_URL=${DATABASE_URL}

RUN npx prisma generate

CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]