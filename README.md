# 🖨️ SIH Team Zero Internal Round - Project Setup Guide

Welcome to the **Team Zero SIH Internal Round** repository. This workspace contains two core applications:
1. **[printershop](file:///Users/apple/Desktop/SIH/printershop)**: An Electron-based desktop application (agent) designed for printer shops, featuring a React frontend and an Express backend.
2. **[user](file:///Users/apple/Desktop/SIH/user)**: A web application designed for users/customers, featuring a React frontend and an Express backend.

---

## 📂 Repository Architecture

```text
team_zero_SIH_Internal_Round/
├── printershop/                   # Electron Desktop Agent for Printer Shops
│   ├── backend/                   # Express API Server (Port 1500)
│   ├── frontend/                  # React + Vite + Tailwind Frontend (Port 5173 / Electron)
│   ├── package.json               # Main Electron Configuration & Scripts
│   └── main.js                    # Electron Main Entrypoint
│
└── user/                          # Web Portal for Customers
    ├── backend/                   # Express API Server (Port 1600)
    └── frontend/                  # React + Vite + Tailwind Frontend (Port 5173)
```

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Desktop Shell** | [Electron](https://www.electronjs.org/) |
| **Frontend Framework** | [React 19](https://react.dev/) + [Vite](https://vite.dev/) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) |
| **Backend API** | [Node.js](https://nodejs.org/) + [Express 5](https://expressjs.com/) |
| **Real-time Communication** | [Socket.io](https://socket.io/) (WebSockets) |
| **Database** | [MongoDB](https://www.mongodb.com/) via [Mongoose](https://mongoosejs.com/) |
| **Security & Auth** | JSON Web Tokens (JWT) + BCryptJS |

---

## 📋 Prerequisites

Before setting up the project, make sure you have the following installed on your machine:
- **Node.js** (v18 or higher recommended)
- **npm** (v9 or higher)
- **MongoDB Community Server** (running locally on port `27017` or a remote MongoDB Atlas connection URI)

---

## 🔑 Environment Variables Setup

Both backend servers rely on environment variables (like ports and database connection URIs) configured via `.env` files. In each backend folder, you will find a `[env.example](file:///Users/apple/Desktop/SIH/printershop/backend/.env.example)` file containing template/placeholder values. 

Before running the applications, you must create a `.env` file in both backend directories by copying the `.env.example` file.

| Application Backend | Config File Location | Port (Default) | MongoDB URI (Default) |
| :--- | :--- | :--- | :--- |
| **Printer Shop** | `[printershop/backend/.env](file:///Users/apple/Desktop/SIH/printershop/backend/.env)` | `1500` | `mongodb://localhost:27017/printershop` |
| **User Portal** | `[user/backend/.env](file:///Users/apple/Desktop/SIH/user/backend/.env)` | `1600` | `mongodb://localhost:27017/user` |

---

## 🚀 Step-by-Step Setup Guide

### 1. Database Setup

Ensure your local MongoDB instance is running. If you are using custom ports or a hosted MongoDB instance (like MongoDB Atlas), you can update the `MONGO_URI` variable in the respective `.env` files as detailed below.

---

### 2. Printer Shop Agent Setup (Electron Desktop App)

The Printer Shop application has a backend server and an Electron desktop wrapper running a React frontend.

#### A. Backend Setup
1. Open a terminal and navigate to the backend folder:
   ```bash
   cd printershop/backend
   ```
2. Install the backend dependencies:
   ```bash
   npm install
   ```
3. Copy the `.env.example` file to create your local configuration:
   ```bash
   cp .env.example .env
   ```
4. Verify or configure the environment variables in `[printershop/backend/.env](file:///Users/apple/Desktop/SIH/printershop/backend/.env)`:
   ```env
   PORT=1500
   MONGO_URI=mongodb://localhost:27017/printershop
   ```
5. Start the backend API server:
   ```bash
   npm start
   ```
   *(The server will run on `http://localhost:1500`)*

#### B. Desktop App & Frontend Setup
1. Open a new terminal and navigate to the printershop root:
   ```bash
   cd printershop
   ```
2. Install the top-level Electron and development dependencies:
   ```bash
   npm install
   ```
3. Navigate to the frontend directory and install frontend dependencies:
   ```bash
   cd frontend
   ```
   ```bash
   npm install
   ```
4. Navigate back to the `printershop` root:
   ```bash
   cd ..
   ```
5. Start the Electron agent in development mode (this will concurrently start the Vite dev server and open the Electron shell):
   ```bash
   npm run dev
   ```

---

### 3. User Portal Setup (Web App)

The User Portal is a web application accessible via standard web browsers.

#### A. Backend Setup
1. Open a new terminal and navigate to the user backend folder:
   ```bash
   cd user/backend
   ```
2. Install the backend dependencies:
   ```bash
   npm install
   ```
3. Copy the `.env.example` file to create your local configuration:
   ```bash
   cp .env.example .env
   ```
4. Verify or configure the environment variables in `[user/backend/.env](file:///Users/apple/Desktop/SIH/user/backend/.env)`:
   ```env
   PORT=1600
   MONGO_URI=mongodb://localhost:27017/user
   ```
5. Start the backend API server:
   ```bash
   node server.js
   ```
   *(The server will run on `http://localhost:1600`)*

#### B. Frontend Setup
1. Open a new terminal and navigate to the user frontend folder:
   ```bash
   cd user/frontend
   ```
2. Install frontend dependencies:
   ```bash
   npm install
   ```
3. Start the Vite React development server:
   ```bash
   npm run dev
   ```
   *(The app will run on `http://localhost:5173` or the next available port)*

---

## 📝 Configuration Summary

Here is a summary of the ports used by default:

* **Printer Shop Application**:
  * Backend: `http://localhost:1500`
  * Frontend Dev Server: `http://localhost:5173` (rendered inside Electron wrapper)
* **User Application**:
  * Backend: `http://localhost:1600`
  * Frontend Dev Server: `http://localhost:5173` (or `http://localhost:5174` if run concurrently)
