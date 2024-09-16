FROM node:alpine

WORKDIR /web-client

COPY package*.json ./

RUN npm install

CMD ["npm","run","dev"]