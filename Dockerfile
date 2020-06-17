FROM node:13.3.0-alpine

RUN mkdir -p /oats/server
WORKDIR /oats/server

COPY ./package*.json ./
COPY .env .
  
COPY . .

RUN npm install

EXPOSE 3000

CMD npm run dev