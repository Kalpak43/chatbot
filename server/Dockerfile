FROM node:22

WORKDIR /app

COPY package.json package-lock.json* ./

RUN npm install

COPY . .

# Start the backend server
CMD ["npm", "run", "dev"]