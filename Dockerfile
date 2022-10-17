FROM node:alpine

WORKDIR /app

COPY ./public ./public
COPY ./src ./src
COPY ./package-lock.json ./
COPY ./package.json ./

RUN npm i

CMD ["npm", "run", "start"]