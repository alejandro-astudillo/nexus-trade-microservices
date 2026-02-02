# 1. Base Stage
FROM node:20-slim AS base
WORKDIR /app
RUN npm i -g npm@latest

# 2. Dependencies Stage
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# 3. Development Stage (Target for local dev)
FROM base AS dev
COPY --from=deps /app/node_modules ./node_modules
COPY . .
CMD ["npm", "run", "start:dev"]

# 4. Builder Stage (Builds the application)
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build
# Prune development dependencies to keep the image small
RUN npm ci --omit=dev && npm cache clean --force

# 5. Production Stage (Target for staging/prod)
FROM base AS prod
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY package.json ./

USER node
CMD ["npm", "run", "start:prod"]
