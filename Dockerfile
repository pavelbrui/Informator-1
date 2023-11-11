FROM node:lts-alpine

WORKDIR /app

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

COPY . /app

RUN npm install && npm run build

EXPOSE 8080

CMD ["npm", "run", "start"]
