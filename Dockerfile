# Build stage
FROM node:20-slim as base
RUN npm install -g pnpm@10.6.1

FROM base as builder
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

# Runner stage
FROM base as runner
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package.json ./

EXPOSE 4173
CMD ["pnpm", "preview", "--host"] 