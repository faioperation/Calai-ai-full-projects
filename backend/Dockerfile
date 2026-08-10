FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --prefer-offline --no-audit

COPY . .

# Generate Prisma Client
RUN npx prisma generate

FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Install curl for Docker health check
RUN apk add --no-cache curl

COPY package*.json ./
RUN npm ci --only=production --prefer-offline --no-audit

COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/src ./src
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./package.json

RUN mkdir -p uploads && chown -R node:node /app

USER node

EXPOSE 8000

CMD ["sh", "-c", "npx prisma migrate deploy && node src/server.js"]