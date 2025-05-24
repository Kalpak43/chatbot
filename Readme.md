## Project Setup

### Prerequisites
- Install [Node.js](https://nodejs.org/) (version 18 or higher recommended).
- Install [MongoDB](https://www.mongodb.com/try/download/community) and ensure it is running.
- Install [Docker](https://www.docker.com/) if you plan to use Docker for deployment.

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend` directory based on `.env.example` and fill in the required values.
4. Start the backend server:
   ```bash
   npm run dev
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `frontend` directory based on `.env.example` and fill in the required values.
4. Start the frontend development server:
   ```bash
   npm run dev
   ```

### Running with Docker
1. Build the Docker image for the backend:
   ```bash
   cd backend
   docker build -t ai-chatbot-backend .
   ```
2. Run the Docker container:
   ```bash
   docker run -p 8080:8080 ai-chatbot-backend
   ```

### Accessing the Application
- Frontend: Open [http://localhost:5173](http://localhost:5173) in your browser.
- Backend: API is available at [http://localhost:8081](http://localhost:8081).



end