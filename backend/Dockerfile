# Use official Node.js LTS image as the base
FROM node:22-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json* ./
RUN npm install --production

# Copy the rest of the backend source code
COPY . .

# Use a smaller image for the final build
FROM node:22-alpine

WORKDIR /app

# Copy only the necessary files from the builder stage
COPY --from=builder /app ./

# Expose the port your app runs on
EXPOSE 8080

# Start the backend server
CMD ["npm", "run", "serve"]
