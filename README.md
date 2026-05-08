# TWA1-W2026-Group07 | AirBnb Listing Explorer & Review Platform

This is a full-stack MERN (MongoDB, Express, React, Node.js) application developed as the final project for the **Transactional Web Applications 1 (420-430-LE)** course at Champlain College Lennoxville.

## Project Overview
The platform allows users to browse a dataset of 5,555 AirBnb property listings, view detailed information, and manage personal profiles. Authenticated users can also submit, edit, and delete reviews, including optional photo uploads.

## Tech Stack
- **Frontend:** React (Vite), React Router, CSS3
- **Backend:** Node.js, Express
- **Database:** MongoDB (via Mongoose ODM)
- **Authentication:** JWT (JSON Web Tokens) & Bcrypt for password hashing
- **File Handling:** Multer for image uploads

---

## Prerequisites
Before running the project, ensure you have the following installed:
- [Node.js](https://nodejs.org) (v16+)
- [MongoDB Community Server](https://mongodb.com)
- [MongoDB Compass](https://mongodb.com) (optional, for visualization)

---

## Installation & Setup

### 1. Clone the Repository
```bash
git clone <git-clone-repo-url>
cd TWA1-W2026-Group07
```

### 2. Backend Configuration
1. Navigate to the server directory: `cd server`
2. Install dependencies: `npm install`
3. Create a `.env` file in the `server` root:
   ```env
   PORT=3000
   MONGO_URI=mongodb://localhost:27017/airbnb_project
   JWT_SECRET=your_super_secret_key
   ```
4. **Import the Dataset:** Ensure your MongoDB local server is running, then run the import script provided:
   ```bash
   node utils/importData.js
   ```

### 3. Frontend Configuration
1. Navigate to the client directory: `cd client`
2. Install dependencies: `npm install`
3. Create a `.env` file in the `client` root:
   ```env
   VITE_API_URL=http://localhost:3000
   ```

---

## Running the Application

### Start the Backend
From the `server` directory:
```bash
npm start
```
or 

```bash
node server.js
```
*The server will run on http://localhost:3000*

### Start the Frontend
From the `client` directory:
```bash
npm run dev
```
*The app will be accessible at http://localhost:5173 (default Vite port)

---

## Features Implemented

### Deliverable 1: Foundation
- Mongoose schemas for Users, Listings, and Reviews.
- User registration and login system with JWT.
- Environment setup and AirBnb dataset import.

### Deliverable 2: Listings & Reviews
- Paginated browse page with city, price, and property type filters.
- Detailed listing pages with full property/host info.
- Full CRUD functionality for reviews (Create, Read, Update, Delete).

### Deliverable 3: Profile & Images
- User Profile page to manage names and view personal review history.
- Image upload support for reviews using **Multer**.
- Static file serving for uploaded photos.

---

## Team Members
- **Student A:** Dieudonné Bondo
- **Student B:** Emmanuelle Isis Mbeugmo Manekeu

**Instructor:** Châkirou Alabani