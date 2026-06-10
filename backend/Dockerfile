FROM oven/bun:1-alpine AS base
RUN apk add --no-cache openssl
WORKDIR /app

FROM base AS deps
COPY package.json bun.lock ./
RUN bun install

FROM deps AS builder
COPY prisma ./prisma
COPY tsconfig.json ./
COPY src ./src
RUN bunx prisma generate
RUN bun run build

FROM base AS runner
ENV NODE_ENV=production
WORKDIR /app

COPY package.json bun.lock ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY scripts/docker-entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 4000
ENTRYPOINT ["/entrypoint.sh"]
