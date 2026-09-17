<div align="center">
🎓 EduCore
A Production-Ready Full-Stack School Management System

Built with Java Spring Boot, React (Vite), and MySQL

Java Spring Boot React MySQL License

Features • Tech Stack • Getting Started • Project Structure • Roadmap • Contributing

</div>
📖 Overview

EduCore is a modern, full-stack School Management System designed to streamline academic administration — from student and staff records to authentication and role-based access control. It pairs a secure, scalable Spring Boot REST API with a fast, responsive React frontend, giving schools a solid foundation to manage their day-to-day operations digitally.

The project ships with a complete authentication flow (JWT-based), a pre-configured database schema with seed data, and a clean, extensible architecture — so you can start building features on day one instead of wiring up boilerplate.

✨ Features
🔐 Secure Authentication — JWT-based login with Spring Security
🧑‍🤝‍🧑 Role-Based Access Control — Admin, Teacher, and Student roles (extensible)
🗄️ Relational Data Model — MySQL schema with seed data included
⚡ Modern Frontend — React + Vite for lightning-fast dev and builds
🎨 Utility-First Styling — Tailwind CSS for rapid UI development
🧭 Client-Side Routing — React Router for a smooth SPA experience
🌍 Global State Management — React Context API
🧱 Modular Architecture — Clean separation of concerns, ready to extend
🛠 Tech Stack
Layer	Technology
Backend	Java 17, Spring Boot, Spring Security, Spring Data JPA, JWT
Frontend	React.js, Vite, Tailwind CSS, React Router, Context API
Database	MySQL
Build Tools	Maven (backend), npm (frontend)
🏗 Architecture
┌─────────────────────┐        REST API (JWT)        ┌──────────────────────┐
│   React Frontend     │ <───────────────────────────> │   Spring Boot API    │
│  (Vite + Tailwind)   │        HTTPS / JSON           │ (Security, JPA, REST)│
└─────────────────────┘                                └──────────┬───────────┘
                                                                    │
                                                                    │ JDBC
                                                                    ▼
                                                          ┌──────────────────┐
                                                          │    MySQL DB      │
                                                          │   (school_db)    │
                                                          └──────────────────┘
✅ Prerequisites

Make sure you have the following installed before you begin:

Java 17+
Node.js & npm
MySQL Server
🚀 Getting Started
1️⃣ Database Setup
Open your MySQL client (MySQL Workbench, DBeaver, or the command line).
Run the provided SQL script to create the database, tables, and seed data:
bash
   mysql -u root -p < database/schema.sql

This creates the school_db database along with its tables and an initial admin user.

🔑 The seeded admin account uses a password hash for admin123. Change this before deploying to production.

2️⃣ Backend Setup
bash
cd backend

Update your database credentials in src/main/resources/application.properties if they differ from the defaults (root / root):

properties
spring.datasource.url=jdbc:mysql://localhost:3306/school_db
spring.datasource.username=root
spring.datasource.password=root

Run the Spring Boot application:

bash
# Windows
mvnw.cmd spring-boot:run

# Mac/Linux
./mvnw spring-boot:run

The API server will start on http://localhost:8080.

3️⃣ Frontend Setup
bash
cd frontend
npm install
npm run dev

Open your browser at http://localhost:5173.

4️⃣ Log In
Field	Value
Username	admin
Password	admin123

⚠️ Update or remove this default credential before any production deployment.

📂 Project Structure
EduCore/
├── backend/                  # Spring Boot REST API
│   ├── src/main/java/...     # Controllers, Services, Repositories, Entities
│   ├── src/main/resources/   # application.properties, static resources
│   └── mvnw / mvnw.cmd       # Maven wrapper
├── frontend/                 # React (Vite) client
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/             # Route-level views
│   │   ├── context/           # Auth & global state (Context API)
│   │   └── routes/             # React Router configuration
│   └── package.json
├── database/
│   └── schema.sql             # DB schema + seed data
└── README.md
🔒 Authentication Flow
User submits credentials via the login form (React).
Backend validates credentials and issues a JWT on success.
The token is stored client-side and attached to the Authorization header on subsequent requests.
Spring Security filters validate the token on each protected endpoint before granting access.
🧭 Roadmap / Further Development

The core architecture (Security, Routing, Layout, State Management) is fully implemented, giving you a solid base to build on. Suggested next steps:

 Student, Teacher, and Class CRUD modules
 Attendance tracking system
 Grade/Report card management
 Fee management & payment integration
 Notice board / announcements
 Role-specific dashboards (Admin / Teacher / Student)
 Email notifications
 Docker Compose setup for one-command local deployment
 CI/CD pipeline (GitHub Actions)
 Unit & integration test coverage
🤝 Contributing

Contributions are welcome! To contribute:

Fork the repository
Create a feature branch: git checkout -b feature/your-feature
Commit your changes: git commit -m "Add your feature"
Push to the branch: git push origin feature/your-feature
Open a Pull Request

Please open an issue first for major changes so we can discuss what you'd like to do.

📄 License

This project is licensed under the MIT License — see the LICENSE file for details.

📬 Contact

Questions, suggestions, or feedback? Feel free to open an issue on this repository.

<div align="center">

Made with ☕ and late nights, for schools that deserve better software.

</div>