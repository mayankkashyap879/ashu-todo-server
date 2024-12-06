# Use Node.js LTS (Long Term Support) version
FROM node:18-slim

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy app source code
COPY . .

# Exclude development files
COPY .env.example .env

# Expose port
EXPOSE 4001

# Start the server
CMD ["node", "server.js"]