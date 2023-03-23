FROM node:16.13.1-alpine3.13

WORKDIR /usr/src/app

COPY . /usr/src/app

RUN yarn install --production=true

EXPOSE 8080

WORKDIR packages/receiver

CMD node lib/receiver.js