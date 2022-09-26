FROM node:16
WORKDIR /usr/src/app

COPY package*.json ./
RUN npm update
RUN npm install
COPY . .

CMD [ "node", "./main.js" ]