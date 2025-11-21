FROM node:20-alpine AS builder

WORKDIR /app

RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    unixodbc-dev

COPY package*.json ./

RUN npm ci --omit=dev

COPY . .

FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache unixodbc

COPY --from=builder /app .

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

USER node

CMD ["node", "src/index.js"]