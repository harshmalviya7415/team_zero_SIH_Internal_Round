# 🖨️ Smart Campus Printing & Document Services

## 🏆 SIH Internal Round Project - Team Zero

This repository contains the source code for the **Smart Campus Printing & Document Services** system, developed for the Smart India Hackathon (SIH) Internal Round by **Team Zero**.

### 👥 Team Members
*   **Amoolya Kamath** (251 CS106)
*   **Aditya Durgad** (251IT005)
*   **Chethan Kumar K L** (251IT018)
*   **Harsh Malviya** (251CV116)
*   **Havish S** (251CS127)
*   **N Shreeda Kumar** (251IT039)

---

## 📖 About the Project

### The Problem
College campuses suffer from high congestion and long queues at local print shops during peak operational hours. Students lack real-time visibility into shop availability, opening status, and queue depth. Furthermore, sharing media is frictional and unsafe, relying on manual, in-person file transfers via flash drives, local messaging apps, or emails.

### The Proposed Solution
Our system bridges college web portals with local print shop hardware:
1. **User Web Portal**: Allows students to upload documents (PDF), select print specifications (copies, paper size, color mode, single/double-sided), make payments securely online, and track the live progress of their jobs.
2. **Electron Desktop Print Agent**: A secure desktop client installed at the print shop. It operates silently in the background, registers local printers, automatically downloads paid documents, appends a transaction log sheet, and spools them directly to the hardware printer.
3. **No Operator Intervention**: The print shop operator does not need to accept, review, or manually trigger print requests. The print outputs automatically from the system, and status transitions ("In Progress", "Completed") sync back to the user in real-time.

---

## 🎥 Project Demo Video

Watch the system in action:

[📺 Play Demo Video](asset/Demo%20Vedio-compressed.mp4)

<video src="asset/Demo%20Vedio-compressed.mp4" controls width="100%"></video>

---

## 📂 Repository Architecture

```text
team_zero_SIH_Internal_Round/
├── backend/                       # Shared Node.js Express Backend (Port 1500)
│   ├── config/                    # Database (Mongoose) & Socket server configurations
│   ├── controller/                # Request handlers (payments, job status, printer registrations)
│   ├── models/                    # Mongoose database models
│   └── server.js                  # Main Express and Socket.IO server entrypoint
│
├── printershop/                   # Electron Desktop Agent for Printer Shops
│   ├── frontend/                  # React + Vite Frontend (runs inside Electron)
│   ├── main.js                    # Electron main process entrypoint
│   ├── printService.js            # PDF-lib modification and print spool service
│   └── package.json               # Electron configuration and scripts
│
└── user/                          # User Web Application
    └── frontend/                  # React + Vite customer portal web client
```

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Desktop Shell** | [Electron](https://www.electronjs.org/) |
| **Frontend Framework** | [React 19](https://react.dev/) + [Vite](https://vite.dev/) |
| **Styling** | Vanilla CSS + [Tailwind CSS v4](https://tailwindcss.com/) |
| **Backend API** | [Node.js](https://nodejs.org/) + [Express](https://expressjs.com/) |
| **Real-time Communication** | [Socket.io](https://socket.io/) (WebSockets) |
| **Database** | [MongoDB](https://www.mongodb.com/) via [Mongoose](https://mongoosejs.com/) |
| **Security & Auth** | JSON Web Tokens (JWT) + BCryptJS |
| **PDF Manipulation** | [PDF-Lib](https://pdf-lib.js.org/) |
| **Native Printing** | [pdf-to-printer](https://github.com/artiebits/pdf-to-printer) (Windows print spooler) |

---

## 🚀 Setup & Launch Guide

### 📋 Prerequisites
*   **Node.js** (v18 or higher)
*   **MongoDB Community Server** (running locally on port `27017` or a remote Atlas connection string)
*   **Default System Printer**: Ensure a physical printer is active, or use **Microsoft Print to PDF** as the default system printer on Windows for virtual/testing environments.

---

### 1. Database & Shared Backend Setup
1. Open a terminal and navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install the backend dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend/` directory by copying `.env.example` (or configure it manually):
   ```env
   PORT=1500
   MONGO_URI=mongodb://localhost:27017/printershop
   JWT_SECRET=your_jwt_secret_here
   RAZORPAY_KEY_ID=your_razorpay_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_key_secret
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   ```
4. Start the backend API & Socket server:
   ```bash
   npm start
   ```
   *(The server will run on `http://localhost:1500`)*

---

### 2. User Portal Setup (Web App)
1. Open a new terminal and navigate to the user frontend directory:
   ```bash
   cd user/frontend
   ```
2. Install the frontend dependencies:
   ```bash
   npm install
   ```
3. Start the Vite React web client:
   ```bash
   npm run dev
   ```
   *(By default, this will run on `http://localhost:5173`)*

---

### 3. Printer Shop Agent Setup (Electron Desktop App)
1. Open a new terminal and navigate to the printershop root directory:
   ```bash
   cd printershop
   ```
2. Install the Electron agent dependencies:
   ```bash
   npm install
   ```
3. Navigate to the printershop frontend directory:
   ```bash
   cd frontend
   ```
4. Install frontend dependencies:
   ```bash
   npm install
   ```
5. Navigate back to the `printershop` root:
   ```bash
   cd ..
   ```
6. Start the Electron agent in development mode:
   ```bash
   npm run dev
   ```
   *(Vite dev server will bind to port `5174`, and Electron will launch and render the dashboard)*

---

## 🛠️ Troubleshooting Tips

### 🖥️ Electron App shows a Blank / White Page
Vite and Electron run concurrently. The user dashboard consumes default port `5173`, pushing the printer shop dev server to port `5174`.
*   Ensure that `printershop/package.json` has `--port 5174` configured for `dev:frontend`.
*   Ensure that `printershop/main.js` calls `win.loadURL("http://localhost:5174")` to look at the correct dev server port.

### 🔴 Printer Shop is Offline error during order checkout
To prevent customers from placing paid orders to closed print shops:
*   The checkout API verifies if the printer shop has an active Socket connection in the room `printer_${printershopid}`.
*   Make sure the Electron desktop app is launched, logged in, and online. Once online, the shop status updates automatically in the DB.

### 📝 Page Range shows "1-1" only on upload
PDF metadata `/Count` properties can be written at the end of the file or compressed into object streams, especially when files contain special characters like `-`, `_`, `(`, or `)` in their name.
*   Our zero-dependency page count reader scans the first 100KB and the last 100KB of the file buffer to accurately retrieve the page count, ensuring correct page ranges and pricing.

### ⚠️ Mock Payment Signature Bypass
For local sandbox testing without active Razorpay credentials:
*   Ensure the checkout Razorpay Order ID parameter starts with `"order_mock_"` (e.g. `order_mock_12345`). This instructs the backend verification endpoint to bypass signature hashing.

---

## 🔮 Future Enhancements

*   **Offline Resilience**: Implement Electron-level local storage (SQLite or local JSON store) to save pending print jobs locally. In case of intermittent campus Wi-Fi drops, the print agent will queue jobs locally and resume printing automatically once connection is restored.
*   **Live Queue Depth Estimation**: Display estimated wait times on the student portal based on the active queue size of each print shop, enabling users to choose less busy locations.
*   **QR Code Collection**: Allow operators to scan a QR code from the user's phone to verify collections and automatically mark completed print jobs as picked up.
*   **Dynamic Capability Status Configuration**: Allow print shop operators to toggle availability status for specific print capabilities (e.g. marking "Colour" or "A3 paper size" as temporarily unavailable due to toner depletion or tray exhaustion), instantly disabling those option selections on the student checkout portal.
