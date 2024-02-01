FROM node:21-alpine3.18

WORKDIR /app

COPY package.json .
COPY package-lock.json .
RUN npm i

COPY . .

EXPOSE 3000
CMD ["node", "index.js"]