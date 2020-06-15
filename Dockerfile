FROM node:13.3.0-alpine

RUN mkdir -p /oats/server
WORKDIR /oats/server

COPY package*.json /oats/server
COPY .env /oats/server

RUN node -v
RUN npm install