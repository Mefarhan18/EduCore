# API Documentation

Base URL: `http://localhost:8080/api`

> All endpoints except `/auth/**` require a valid JWT token in the `Authorization` header (`Bearer <token>`).

## 1. Authentication (`/auth`)

### POST `/auth/login`
Authenticates a user and returns a JWT token.

**Request Body:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response (200 OK):**
```json
{
  "token": "eyJhbG...",
  "type": "Bearer",
  "id": 1,
  "username": "admin",
  "role": "ROLE_ADMIN"
}
```

---

## 2. Dashboard (`/dashboard`)

### GET `/dashboard/admin`
Returns overview statistics for the admin dashboard.
**Role Required:** `ADMIN`

**Response (200 OK):**
```json
{
  "totalStudents": 150,
  "totalTeachers": 25,
  "totalClasses": 10
}
```

---

## 3. Students (`/students`)

### GET `/students`
Retrieves a list of all students.
**Role Required:** `ADMIN`, `TEACHER`

### GET `/students/{id}`
Retrieves details of a specific student.
**Role Required:** `ADMIN`, `TEACHER`, `STUDENT` (if requesting own details)

### POST `/students`
Creates a new student record.
**Role Required:** `ADMIN`

**Request Body:**
```json
{
  "name": "John Doe",
  "rollNo": "101",
  "dob": "2005-08-15",
  "contact": "1234567890",
  "address": "123 Main St"
}
```

### PUT `/students/{id}`
Updates an existing student record.
**Role Required:** `ADMIN`

### DELETE `/students/{id}`
Deletes a student record.
**Role Required:** `ADMIN`
