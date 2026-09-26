FROM node:22

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci

COPY . .

RUN --mount=type=secret,id=env,target=/app/.env.local npm run build

CMD ["npm", "start"]


