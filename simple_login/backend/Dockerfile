FROM node:18
# FROM node:20-alpine

WORKDIR /backend

COPY package*.json ./
RUN npm install

COPY . .
RUN npx prisma generate
EXPOSE 5000
CMD ["sh", "-c", "npx prisma migrate deploy && node ./src/server.js"]
# CMD ["node", "./src/server.js"]