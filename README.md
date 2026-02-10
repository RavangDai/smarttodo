# KaryaAI 🚀

A modern, intelligent task management application powered by AI. This app goes beyond simple to-do lists by integrating smart scheduling and AI-driven insights to help you manage your day effectively.

## ✨ Features

- **AI-Powered Scheduling**: Automatically generate daily plans and task breakdowns using Google's Gemini AI.
- **Smart Insights**: Real-time analytics and productivity insights.
- **Drag & Drop**: Intuitive task management using `@dnd-kit`.
- **Natural Language Input**: specialized input for creating tasks using natural language.
- **Focus Mode**: Dedicated mode to help you concentrate on the task at hand.
- **Secure Authentication**: Robust user authentication with JWT and bcrypt.

## 🛠️ Tech Stack

### Client (Frontend)
- **Framework**: React 19 (Vite)
- **Styling**: Vanilla CSS / CSS Modules
- **Drag & Drop**: @dnd-kit/core
- **Icons**: React Icons
- **HTTP Client**: Axios

### Server (Backend)
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (via Mongoose)
- **AI Integration**: Google Generative AI (Gemini)
- **Authentication**: JSON Web Tokens (JWT)

## 📋 Prerequisites

Before running the application, make sure you have the following installed:
- [Node.js](https://nodejs.org/) (v14 or higher)
- [MongoDB](https://www.mongodb.com/) (Local instance or Atlas URI)

You will also need a **Google Gemini API Key**.

## 🚀 Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository_url>
   cd smart-todo-app
   ```

2. **Backend Setup**
   Navigate to the server directory and install dependencies:
   ```bash
   cd server
   npm install
   ```

   Create a `.env` file in the `server` directory with the following variables:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   GEMINI_API_KEY=your_google_gemini_api_key
   ```

3. **Frontend Setup**
   Open a new terminal, navigate to the client directory, and install dependencies:
   ```bash
   cd client
   npm install
   ```

## 🏃‍♂️ Running the Application

1. **Start the Backend Server**
   Inside the `server` directory:
   ```bash
   npm run dev
   # or
   npm start
   ```
   The server will run on `http://localhost:5000`.

2. **Start the Frontend Client**
   Inside the `client` directory:
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:5173` (or the port shown in your terminal).

## 📂 Project Structure

```
smart-todo-app/
├── client/          # React Frontend
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── utils/       # Helper functions & API setup
│   │   └── ...
│   ├── package.json
│   └── ...
├── server/          # Express Backend
│   ├── models/      # Mongoose Models
│   ├── routes/      # API Routes
│   ├── middleware/  # Auth & Error handling
│   ├── package.json
│   └── ...
└── README.md        # Project Documentation
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

© 2026 Bibek Pathak. All rights reserved.
