# FROM node:22.12.0

# WORKDIR /app

# COPY package.json /app

# RUN npm install

# COPY . /app

# CMD ["npm", "start"]

FROM node:22-alpine

# Create app directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy app source
COPY . .

# Create a non-root user and switch to it
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

EXPOSE 5000

CMD ["node", "index.js"]