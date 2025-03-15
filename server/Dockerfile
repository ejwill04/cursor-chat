# Build stage
FROM node:20-slim as base
RUN apt-get update -y && apt-get install -y openssl
RUN npm install -g pnpm@10.6.1

# Builder stage
FROM base as builder
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm prisma generate
RUN pnpm build

# Runner stage
FROM base as runner
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package.json ./
COPY prisma ./prisma

CMD ["sh", "-c", "pnpm prisma generate && pnpm prisma migrate deploy && node dist/server.js"] 