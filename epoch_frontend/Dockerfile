# Use the official Node.js image as a base image
FROM node:16

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the entire frontend directory to the working directory
COPY . .

# Build your React app
RUN npm run build

EXPOSE 443
EXPOSE 80

# Command to run your Node.js server
CMD ["node", "server.js"]
