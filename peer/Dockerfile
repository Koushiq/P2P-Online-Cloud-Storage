FROM node:14

WORKDIR /usr/src/app

COPY package*.json ./

COPY src src/

RUN npm install

EXPOSE 6000

CMD [ "node", "src/app.js" ]