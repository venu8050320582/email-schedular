FROM node:22-alpine3.20

WORKDIR /app

COPY package*.json ./

RUN apk update && apk upgrade --no-cache && npm cache clean --force

COPY . .

RUN npm install --include=dev

EXPOSE 5000

CMD ["npm", "run", "dev"]
