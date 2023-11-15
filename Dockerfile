FROM node:18

WORKDIR /app

COPY . /app

RUN npm install && npm run build

EXPOSE 8080

CMD ["npm", "run", "start"]
