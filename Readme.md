# J.A.C.A. - Just Another Chat Application

This project is a full-stack chat application with a React + TypeScript + Vite client and a Node.js + Express + MongoDB server.

---

## Prerequisites

- [Node.js](https://nodejs.org/) (v18+ recommended)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- [MongoDB](https://www.mongodb.com/) instance (local or cloud)
- [Qdrant] (https://qdrant.tech/) instance (local or cloud) OR [Chroma](https://www.trychroma.com/) instance (local)
- [Firebase](https://firebase.google.com/) project for authentication
- (Optional) [Docker](https://www.docker.com/) for containerized setup

---

## 1. Clone the Repository

```sh
git clone <repo-url>
cd chatbot
```

---

## 2. Setup Environment Variables

### Server

1. Copy the example env file and fill in required values:
   ```sh
   cp server/.env.example server/.env
   ```
2. Edit `server/.env` and set the required keys as given in the .env.example.

### Client

1. Copy the example env file and fill in required values:
   ```sh
   cp client/.env.example client/.env
   ```
2. Edit `client/.env` and set the required keys as given in the .env.example.
---

## 3. Install Dependencies

### Server

```sh
cd server
npm install
```

### Client

```sh
cd ../client
npm install
```

---

## 4. Run the Applications

### Start the Server

```sh
cd server
npm run dev
```
- The server should run on [http://localhost:8080](http://localhost:8080) by default.

### Start the Client

```sh
cd ../client
npm run dev
```
- The client should run on [http://localhost:5173](http://localhost:5173) by default.

---

## 5. Usage

- Open [http://localhost:5173](http://localhost:5173) in your browser.
- Sign up or log in with your credentials.
- Start chatting!

---

## 6. Docker (Optional)

You can use Docker to run the server in containers. See the `Dockerfile.dev` and `compose.yml` in each directory for details.

---

## 7. Troubleshooting

- Ensure MongoDB is running and accessible.
- Check that all environment variables are set correctly.
- For Firebase authentication, ensure your credentials are valid and the project is configured.

---
