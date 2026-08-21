Gen-BookZ Bookstore 📚

A full-stack online bookstore application with a React frontend and a Node.js/Express backend.

Overview

Gen-BookZ Bookstore lets users browse an online book catalog through a React client that communicates with OpenLibrary API. The project is split into two parts to keep client and server concerns separate:

Gen-BookZ-Bookstore/
├── frontend/     # React client
├── backend/      # Express server & REST API
└── README.md
Features
Browse and view book listings
Client-server communication through a REST API
Authentication through Clerk
Payments through Stripe
Data storage and querying with Neon SQL
Tech Stack
Frontend: React.js, JavaScript, HTML/CSS
Backend: Node.js, Express.js
Database: SQL
Getting Started
Prerequisites
Node.js and npm installed
Installation
bash
git clone https://github.com/emmadrm/Gen-BookZ-Bookstore.git
cd Gen-BookZ-Bookstore

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
Running locally
bash
# Start the backend (in /backend)
nodemon server.js

# In a separate terminal, start the frontend (in /frontend)
npm run dev
