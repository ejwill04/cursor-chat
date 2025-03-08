FROM node:20-slim AS base
RUN apt-get update -y && apt-get install -y openssl
RUN npm install -g pnpm@10.6.1

FROM base AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

FROM base AS runner
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-lock.yaml ./
COPY --from=builder /app/prisma ./prisma
RUN pnpm install --prod --frozen-lockfile
RUN pnpm add -D prisma

# Create a shell script to handle startup
COPY <<-"EOF" /app/start.sh
#!/bin/sh
pnpm prisma migrate deploy
pnpm prisma generate
node dist/server.js
EOF

RUN chmod +x /app/start.sh
EXPOSE 3000
CMD ["/app/start.sh"] 