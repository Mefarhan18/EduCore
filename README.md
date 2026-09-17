# 🎓 EduCore

### Full-Stack School Management System

**EduCore** is a modern school management platform built with **Java Spring Boot, React, and MySQL**. It provides a secure foundation for managing students, teachers, classes, attendance, academic results, fees, notifications, and role-based access.

[![Java](https://img.shields.io/badge/Java-17%2B-orange?logo=openjdk)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.x-brightgreen?logo=springboot)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-Vite-61DAFB?logo=react)](https://react.dev/)
[![MySQL](https://img.shields.io/badge/MySQL-8%2B-4479A1?logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.x-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

**Repository:** https://github.com/Mefarhan18/EduCore

---

## 📑 Table of Contents

- [📖 Overview](#-overview)
- [✨ Features](#-features)
- [👥 User Roles](#-user-roles)
- [🏗️ Architecture](#️-architecture)
- [🛠️ Tech Stack](#️-tech-stack)
- [🔐 Authentication](#-authentication)
- [📂 Project Structure](#-project-structure)
- [🚀 Getting Started](#-getting-started)
- [🔑 Default Login](#-default-login)
- [🌐 API Overview](#-api-overview)
- [🗄️ Database](#️-database)
- [🧭 Roadmap](#-roadmap)
- [🧪 Testing](#-testing)
- [🐳 Docker](#-docker)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

---

## 📖 Overview

EduCore is designed to help schools move from manual records and spreadsheet-based workflows toward a centralized digital management system.

The application follows a **frontend + REST API + database** architecture:

- A **React** frontend provides the user interface.
- A **Spring Boot** backend exposes REST APIs and handles business logic.
- **Spring Security + JWT** protect authenticated endpoints.
- **Spring Data JPA / Hibernate** manages persistence.
- **MySQL** stores application data.

### 🎯 Main Goals

- Centralize school information in one system.
- Provide secure, role-based access.
- Reduce repetitive manual administration.
- Make academic information easier to manage.
- Provide a foundation that can be extended with additional modules.

---

## ✨ Features

### 🔐 Authentication & Security

- JWT-based authentication
- Spring Security integration
- Protected REST API endpoints
- Role-based authorization
- Admin, Teacher, and Student roles
- Token-based authorization for subsequent API requests

### 👨‍🎓 Student Management

- Student profile management
- Student academic information
- Student records
- Role-specific student access

### 👨‍🏫 Teacher Management

- Teacher profile management
- Teacher records
- Class-related teacher management
- Role-specific teacher access

### 🏫 Class Management

- Class organization
- Student-class relationships
- Teacher-class relationships

### 📅 Attendance

- Attendance tracking
- Attendance records
- Student attendance history
- Teacher-oriented attendance workflows

### 📝 Results & Grades

- Student marks
- Examination results
- Academic records
- Result viewing
- Report-card functionality planned for further development

### 💰 Fee Management

- Student fee records
- Fee tracking
- Payment records
- Pending fee management

### 📢 Notifications

- School notifications
- Student-related notifications
- Role-specific notification handling
- Notification management foundation

### 📊 Dashboards

- Role-specific access
- Admin-oriented management views
- Teacher-oriented views
- Student-oriented views

---

## 👥 User Roles

| Role | Access & Responsibilities |
|---|---|
| 👑 **Admin** | Manage users, students, teachers, classes, academic records, fees, notifications, and system access |
| 👨‍🏫 **Teacher** | Access assigned academic functionality, attendance, classes, and student-related information |
| 👨‍🎓 **Student** | View personal academic information, attendance, results, fees, and notifications |

> Access is controlled through authentication and role-based authorization.

---

## 🏗️ Architecture

```text
┌──────────────────────────────┐
│        React Frontend        │
│                              │
│  Vite • Tailwind • Router    │
│  Context API • Components    │
└──────────────┬───────────────┘
               │
               │ HTTP / JSON
               │ Authorization: Bearer JWT
               ▼
┌──────────────────────────────┐
│       Spring Boot API        │
│                              │
│  Controllers                 │
│       ↓                      │
│  Services                    │
│       ↓                      │
│  Repositories                │
│       ↓                      │
│  JPA / Hibernate             │
│                              │
│  Spring Security + JWT       │
└──────────────┬───────────────┘
               │
               │ JDBC
               ▼
┌──────────────────────────────┐
│        MySQL Database        │
│                              │
│          school_db           │
└──────────────────────────────┘
```

---

## 🔐 Authentication

EduCore uses JWT-based authentication.

```text
1. User enters credentials
            │
            ▼
2. React sends login request
            │
            ▼
3. Spring Boot validates credentials
            │
            ▼
4. Server generates JWT
            │
            ▼
5. React stores the authentication token
            │
            ▼
6. Token is attached to protected requests
            │
            ▼
7. Spring Security validates the JWT
            │
            ▼
8. Authorized request reaches the endpoint
```

### Request Authorization

Protected requests use the standard Authorization header:

```http
Authorization: Bearer <JWT_TOKEN>
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Language** | Java 17+ |
| **Backend Framework** | Spring Boot 3.x |
| **Security** | Spring Security + JWT |
| **Persistence** | Spring Data JPA + Hibernate |
| **API** | REST + JSON |
| **Frontend** | React.js + Vite |
| **Styling** | Tailwind CSS |
| **Routing** | React Router |
| **State Management** | React Context API |
| **Database** | MySQL 8+ |
| **Backend Build** | Maven |
| **Frontend Package Manager** | npm |

---

## 📂 Project Structure

```text
EduCore/
│
├── backend/
│   ├── src/
│   │   └── main/
│   │       ├── java/
│   │       │   └── com/
│   │       │       └── example/
│   │       │           └── backend/
│   │       │               ├── controller/
│   │       │               ├── service/
│   │       │               ├── repository/
│   │       │               ├── entity/
│   │       │               ├── security/
│   │       │               └── config/
│   │       │
│   │       └── resources/
│   │           └── application.properties
│   │
│   ├── pom.xml
│   ├── mvnw
│   └── mvnw.cmd
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   ├── routes/
│   │   ├── services/
│   │   └── App.jsx
│   │
│   ├── package.json
│   └── vite.config.js
│
├── database/
│   └── schema.sql
│
├── API_DOCUMENTATION.md
├── README.md
└── LICENSE
```

---

## 🚀 Getting Started

### 📋 Prerequisites

Install the following software before running the project:

- [Java 17 or higher](https://www.oracle.com/java/technologies/downloads/)
- [Node.js and npm](https://nodejs.org/)
- [MySQL 8 or higher](https://dev.mysql.com/downloads/mysql/)
- Git

Verify the installations:

```bash
java -version
node -v
npm -v
mysql --version
git --version
```

---

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/Mefarhan18/EduCore.git
cd EduCore
```

---

### 2️⃣ Database Setup

Start your MySQL server and create the database:

```sql
CREATE DATABASE school_db;
```

The project includes a database schema and seed data in:

```text
database/schema.sql
```

You can execute it using:

```bash
mysql -u root -p < database/schema.sql
```

Or open `database/schema.sql` in MySQL Workbench and execute it there.

---

### 3️⃣ Configure the Backend

Open:

```text
backend/src/main/resources/application.properties
```

Configure the database connection:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/school_db
spring.datasource.username=root
spring.datasource.password=root

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true

server.port=8080
```

Replace the username and password with your local MySQL credentials if necessary.

> ⚠️ Do not commit real production database passwords or secrets to GitHub.

---

### 4️⃣ Start the Spring Boot Backend

Open a terminal in the project root and run:

#### Windows

```bash
cd backend
mvnw.cmd spring-boot:run
```

#### Linux / macOS

```bash
cd backend
./mvnw spring-boot:run
```

The backend API will be available at:

```text
http://localhost:8080
```

---

### 5️⃣ Start the React Frontend

Open a **new terminal** and run:

```bash
cd frontend
npm install
npm run dev
```

Vite will display the local development URL in the terminal.

The default URL is:

```text
http://localhost:5173
```

---

## 🔑 Default Login

If the database seed data contains the default administrator account, use:

| Field | Value |
|---|---|
| **Username** | `admin` |
| **Password** | `admin123` |
| **Role** | Admin |

> ⚠️ **Security:** This is a development credential. Change or remove it before deploying the application to production.

---

## 🌐 API Overview

The backend exposes REST endpoints for the application's main modules.

### 🔐 Authentication

```http
POST /api/auth/login
```

### 👨‍🎓 Students

```http
GET    /api/students
GET    /api/students/{id}
POST   /api/students
PUT    /api/students/{id}
DELETE /api/students/{id}
```

### 👨‍🏫 Teachers

```http
GET    /api/teachers
GET    /api/teachers/{id}
POST   /api/teachers
PUT    /api/teachers/{id}
DELETE /api/teachers/{id}
```

### 📅 Attendance

```http
GET  /api/attendance
POST /api/attendance
```

### 📝 Results

```http
GET  /api/results
POST /api/results
PUT  /api/results/{id}
```

For the complete endpoint list and request/response details, see:

**[API_DOCUMENTATION.md](API_DOCUMENTATION.md)**

---

## 🗄️ Database

EduCore uses **MySQL** for persistent data storage.

The database schema is maintained in:

```text
database/schema.sql
```

### Core Data Relationships

```text
User
├── Admin
├── Teacher
└── Student

Student
├── Attendance
├── Results
└── Fees

Teacher
└── Classes

Class
├── Students
└── Teacher
```

The exact database structure should be treated as defined by `database/schema.sql`.

---

## 🧭 Roadmap

### ✅ Foundation

- [x] Spring Boot REST API
- [x] React + Vite frontend
- [x] MySQL database integration
- [x] JWT authentication
- [x] Spring Security
- [x] Role-based access control
- [x] React Router
- [x] Context API
- [x] Modular frontend/backend structure

### 🚧 Further Development

- [ ] Complete Student CRUD
- [ ] Complete Teacher CRUD
- [ ] Complete Class CRUD
- [ ] Advanced attendance management
- [ ] Complete grade and report-card management
- [ ] PDF report-card generation
- [ ] Fee management enhancements
- [ ] Payment integration
- [ ] Notice board and announcements
- [ ] Email notifications
- [ ] SMS notifications
- [ ] Advanced role-specific dashboards
- [ ] Docker Compose
- [ ] GitHub Actions CI/CD
- [ ] Unit test coverage
- [ ] Integration test coverage

---

## 🧪 Testing

The project can be extended with a dedicated automated testing suite using:

- **JUnit**
- **Mockito**
- **Spring Boot Test**
- **Integration Testing**
- **Authentication and Authorization Testing**

Recommended test coverage includes:

```text
Controller
   ↓
Service
   ↓
Repository
   ↓
Database
```

---

## 🐳 Docker

Docker Compose support is planned to simplify local deployment.

The intended setup will contain:

```text
┌─────────────────────┐
│   React Frontend    │
└─────────┬───────────┘
          │
┌─────────▼───────────┐
│ Spring Boot Backend │
└─────────┬───────────┘
          │
┌─────────▼───────────┐
│   MySQL Database    │
└─────────────────────┘
```

Planned command:

```bash
docker compose up
```

---

## 🤝 Contributing

Contributions are welcome.

### 1. Fork the repository

Create your own fork of the EduCore repository.

### 2. Create a feature branch

```bash
git checkout -b feature/your-feature
```

### 3. Make your changes

Implement and test your feature.

### 4. Stage the changes

```bash
git add .
```

### 5. Commit

```bash
git commit -m "Add your feature"
```

### 6. Push

```bash
git push origin feature/your-feature
```

### 7. Open a Pull Request

Open a Pull Request on GitHub and describe your changes.

For large changes, open an issue first so the proposed changes can be discussed.

---

## 📄 License

This project is licensed under the **MIT License**.

See the [LICENSE](LICENSE) file for details.

---

## ⭐ Support

If you find EduCore useful, consider giving the repository a ⭐ on GitHub.

Every contribution, issue, and suggestion helps improve the project.

---

## 🎓 EduCore

**Modern technology for simpler school management.**

Built with ☕ Java, ⚛️ React, and 🐬 MySQL.
