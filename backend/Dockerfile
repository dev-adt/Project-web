# Base image
FROM node:20-alpine AS base

# Install openssl for Prisma client
RUN apk add --no-cache openssl

# Set working directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --legacy-peer-deps

# Copy codebase
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Development target
FROM base AS development
ENV NODE_ENV=development
EXPOSE 4000
CMD ["npm", "run", "start:dev"]

# Build target
FROM base AS build
RUN npm run build
RUN npm prune --production

# Production target
FROM node:20-alpine AS production
RUN apk add --no-cache openssl
WORKDIR /usr/src/app
COPY --from=build /usr/src/app/package*.json ./
COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/prisma ./prisma
ENV NODE_ENV=production
EXPOSE 4000
CMD ["node", "dist/main"]
