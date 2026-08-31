# Multi-stage: dev-зависимости и исходники не попадают в финальный образ,
# в нём остаются только прод-зависимости, dist и prisma/ (схема и миграции).

FROM node:22-alpine AS deps
RUN apk add --no-cache openssl
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-alpine AS build
RUN apk add --no-cache openssl
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Клиент генерируется до сборки: dist импортирует уже сгенерированные типы.
RUN npx prisma generate --schema prisma/schema.prisma && npm run build

FROM node:22-alpine AS runner
# openssl нужен движку запросов Prisma.
RUN apk add --no-cache openssl
WORKDIR /app
ENV NODE_ENV=production

COPY package.json package-lock.json ./
# Prisma CLI остаётся в прод-зависимостях намеренно: entrypoint применяет
# миграции при старте контейнера, а значит CLI нужен в рантайм-образе.
RUN npm ci --omit=dev && npm cache clean --force

# Сгенерированный клиент переносится из build-стадии, чтобы не гонять
# generate ещё раз и не тащить сюда исходники.
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build /app/dist ./dist
COPY prisma ./prisma
COPY docker-entrypoint.sh ./

RUN chmod +x docker-entrypoint.sh && chown -R node:node /app
USER node

EXPOSE 3000
ENTRYPOINT ["./docker-entrypoint.sh"]
