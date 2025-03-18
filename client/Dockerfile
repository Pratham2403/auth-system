# FROM node:22.12.0

# WORKDIR /app

# COPY package.json /app

# RUN npm install

# COPY . /app

# CMD ["npm", "start"]


FROM node:22-alpine AS build

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy app source
COPY . .

# Build the application
RUN npm run build

# Production stage with minimal image
FROM node:22-alpine

WORKDIR /app

# Install serve to host the static files
RUN npm install -g serve

# Copy built assets from build stage
COPY --from=build /app/dist /app

# Run as non-root user for better security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

EXPOSE 3000

# Use serve for production hosting
CMD ["serve", "-s", ".", "-l", "3000"]
