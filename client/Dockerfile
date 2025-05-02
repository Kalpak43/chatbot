FROM node:22

WORKDIR /app

COPY package.json package-lockjson* ./

RUN npm install

COPY . .

CMD ["npm", "run", "dev",  "--", "--host"]