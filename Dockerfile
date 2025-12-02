# Use Node.js official image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy config.env file into container
COPY config.env ./config.env

# Copy all remaining project files
COPY . .

# Expose port
EXPOSE 3000

# Start the app
CMD ["npm", "start"]
