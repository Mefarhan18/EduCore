# EduCore

A production-ready full-stack School Management System built with Java Spring Boot, React.js (Vite), and MySQL.

## Architecture

- **Backend:** Spring Boot (REST API, Spring Security, JWT, Data JPA)
- **Frontend:** React (Vite, Tailwind CSS, React Router, Context API)
- **Database:** MySQL

## Prerequisites
- Java 17+
- Node.js & npm
- MySQL Server

---

## 1. Database Setup

1. Open your MySQL client (e.g., MySQL Workbench or Command Line).
2. Run the provided SQL script located at `database/schema.sql` to create the `school_db` database, tables, and seed data.
3. The seed data includes an admin user. The default password hash in the script is for `admin123`.

---

## 2. Backend Setup

1. Open a terminal and navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Update the database credentials in `src/main/resources/application.properties` if they differ from the defaults (`root` / `root`).
3. Run the Spring Boot application using Maven Wrapper (or your IDE):
   ```bash
   # Windows
   mvnw.cmd spring-boot:run
   
   # Mac/Linux
   ./mvnw spring-boot:run
   ```
4. The server will start on `http://localhost:8080`.

---

## 3. Frontend Setup

1. Open a new terminal and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install the dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to `http://localhost:5173`.
5. Login with Username: `admin`.

## Further Development

The core architecture (Security, Routing, Layout, State Management) is fully implemented. You can easily extend the application by adding more pages (e.g., `Students.jsx`, `Teachers.jsx`) inside `frontend/src/pages/` and mapping them to the backend API endpoints exposed in the controllers.
