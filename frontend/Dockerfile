# Base image
FROM node:20-alpine AS base

# Set working directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --legacy-peer-deps

# Copy codebase
COPY . .

# Development target
FROM base AS development
ENV NODE_ENV=development
EXPOSE 3000
CMD ["npm", "run", "dev"]

# Build target
FROM base AS build
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build
RUN npm prune --production --legacy-peer-deps

# Production target
FROM node:20-alpine AS production
WORKDIR /usr/src/app
COPY --from=build /usr/src/app/package*.json ./
COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/.next ./.next
COPY --from=build /usr/src/app/public ./public
ENV NODE_ENV=production
EXPOSE 3000
CMD ["npm", "run", "start"]
