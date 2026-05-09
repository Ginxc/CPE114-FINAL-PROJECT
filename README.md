# Student Portal API 

A RESTful API for managing student enrollments, instructor assignments, subjects, and academic records. Built with Node.js, Express, Sequelize, and MySQL.

## What It Does

This comprehensive API digitizes academic management and streamlines student enrollment operations for educational institutions.

The data model mirrors how real universities work: an instructor teaches multiple subjects, students enroll in multiple subjects through a junction table, and the system tracks enrollment dates, grades, and enrollment status (enrolled/dropped/completed).

**Real-world problem solved:** Traditional academic management relies on manual spreadsheets and paper records, leading to data redundancy, errors, and inefficient tracking. This API provides a centralized, programmatic interface that enables:

- **Efficient Student Management**: Track student information, enrollment history, and academic progress
- **Instructor Coordination**: Manage instructor profiles, department assignments, and teaching loads  
- **Subject Organization**: Maintain subject catalogs with schedules, room assignments, and instructor allocations
- **Enrollment Processing**: Handle student enrollments, drops, grade submissions, and academic records

The system implements a robust REST API architecture following the MVC pattern, making it scalable, maintainable, and easily integrable with frontend applications like student portals, administrative dashboards, or mobile apps.

## Tech Stack

| Technology | Version | Role |
|------------|---------|------|
| Node.js | 20.x | JavaScript runtime |
| Express.js | 4.18.x | Web framework & routing |
| Sequelize | 6.35.x | ORM for database interaction |
| MySQL | 8.x | Relational database |
| dotenv | 16.3.x | Environment configuration |
| mysql2 | 3.6.x | MySQL driver |
| cors | 2.8.x | Cross-origin resource sharing |
| nodemon | 3.0.x | Development auto-restart |

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MySQL Server (v8 or higher)
- npm or yarn package manager

### 1. Clone and Install
```bash
git clone https://github.com/YOUR_USERNAME/student-portal-api.git
cd student-portal-api
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
```
Fill in your database credentials in .env:
```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=student_portal_db
DB_DIALECT=mysql
```

### 3. Create the Database
Open MySQL and run:
```sql
CREATE DATABASE student_portal_db;
```

### 4. Start the Server
```bash
node index.js
# or
npm start
```
Sequelize will automatically create all tables on startup. You should see:
```text
✓ Database synchronized
✓ Server running on http://localhost:3000
✓ Test health: http://localhost:3000/health
```

## Database Schema

### Students Table

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY, AUTO_INCREMENT | Unique student ID |
| studentNumber | VARCHAR(20) | NOT NULL, UNIQUE | Official student ID number |
| firstName | VARCHAR(100) | NOT NULL | Student's first name |
| lastName | VARCHAR(100) | NOT NULL | Student's last name |
| email | VARCHAR(100) | NOT NULL, UNIQUE | Student's email address |
| phoneNumber | VARCHAR(15) | NULL | Contact phone number |
| enrollmentDate | DATE | NOT NULL, DEFAULT NOW() | Date of enrollment |
| createdAt | DATETIME | NOT NULL | Record creation timestamp |
| updatedAt | DATETIME | NOT NULL | Last update timestamp |

### Instructors Table

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY, AUTO_INCREMENT | Unique instructor ID |
| instructorNumber | VARCHAR(20) | NOT NULL, UNIQUE | Official instructor ID |
| firstName | VARCHAR(100) | NOT NULL | Instructor's first name |
| lastName | VARCHAR(100) | NOT NULL | Instructor's last name |
| email | VARCHAR(100) | NOT NULL, UNIQUE | Instructor's email |
| department | VARCHAR(100) | NOT NULL | Academic department |
| hireDate | DATE | NOT NULL, DEFAULT NOW() | Employment start date |
| createdAt | DATETIME | NOT NULL | Record creation timestamp |
| updatedAt | DATETIME | NOT NULL | Last update timestamp |

### Subjects Table

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY, AUTO_INCREMENT | Unique subject ID |
| subjectCode | VARCHAR(20) | NOT NULL, UNIQUE | Course code (e.g., CPE114) |
| subjectName | VARCHAR(200) | NOT NULL | Full subject/course name |
| description | TEXT | NULL | Course description |
| units | INTEGER | NOT NULL (1-6) | Credit units |
| schedule | VARCHAR(100) | NULL | Class schedule (e.g., MWF 9:00-10:30) |
| room | VARCHAR(50) | NULL | Classroom assignment |
| instructorId | INTEGER | FOREIGN KEY | References instructors(id) |
| createdAt | DATETIME | NOT NULL | Record creation timestamp |
| updatedAt | DATETIME | NOT NULL | Last update timestamp |

**Foreign Key:** `subjects.instructorId` → `instructors(id)` ON DELETE SET NULL

### Enrollments Table (Junction Table)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY, AUTO_INCREMENT | Unique enrollment record ID |
| studentId | INTEGER | NOT NULL, FOREIGN KEY | References students(id) |
| subjectId | INTEGER | NOT NULL, FOREIGN KEY | References subjects(id) |
| enrollmentDate | DATE | NOT NULL, DEFAULT NOW() | When enrollment occurred |
| grade | FLOAT | NULL (0-100) | Final grade |
| status | ENUM | DEFAULT 'enrolled' | Enrollment status |
| createdAt | DATETIME | NOT NULL | Record creation timestamp |
| updatedAt | DATETIME | NOT NULL | Last update timestamp |

**Foreign Keys:**
- `enrollments.studentId` → `students(id)` ON DELETE CASCADE
- `enrollments.subjectId` → `subjects(id)` ON DELETE CASCADE

**Status Values:** `'enrolled'`, `'dropped'`, `'completed'`

## Entity Relationship Diagram

```text
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│    students     │         │   enrollments    │         │    subjects     │
├─────────────────┤         ├──────────────────┤         ├─────────────────┤
│ id (PK)         │◄───────│ studentId (FK)    │         │ id (PK)         │
│ studentNumber   │         │ subjectId (FK)    │────────►│ subjectCode     │
│ firstName       │         │ enrollmentDate   │         │ subjectName     │
│ lastName        │         │ grade             │         │ description     │
│ email           │         │ status            │         │ units           │
│ phoneNumber     │         │ createdAt         │         │ schedule        │
│ enrollmentDate  │         │ updatedAt         │         │ room            │
│ createdAt       │         └──────────────────┘         │ instructorId (FK)
│ updatedAt       │                                       │ createdAt       │
└─────────────────┘                                       │ updatedAt       │
                                                          └─────────────────┘
                                                                   │
                                                                   │
                                                             ┌─────▼─────┐
                                                             │instructors│
                                                             ├───────────┤
                                                             │ id (PK)   │
                                                             │ instructorNumber│
                                                             │ firstName │
                                                             │ lastName  │
                                                             │ email     │
                                                             │ department│
                                                             │ hireDate  │
                                                             │ createdAt │
                                                             │ updatedAt │
                                                             └───────────┘
```


### Relationships Summary

| Relationship Type | Entities | Foreign Key Location | Through Table |
|------------------|----------|---------------------|---------------|
| One-to-Many | Instructor → Subject | subjects.instructorId | N/A |
| Many-to-Many | Student ↔ Subject | enrollments (junction) | enrollments |

### Project Structure
```
student-portal-api/
│
├── index.js                   # Main entry point (starts server)
├── package.json               # Dependencies and scripts
├── package-lock.json          # Locked dependency versions
├── .env.example               # Template for environment variables
├── .gitignore                 # Git ignore rules
├── README.md                  # API documentation
│
├── src/
│   ├── app.js                 # Express app configuration
│   │
│   ├── config/
│   │   └── database.js        # Sequelize database connection setup
│   │
│   ├── models/
│   │   ├── index.js           # Model associations and exports
│   │   ├── Student.js         # Student model schema
│   │   ├── Instructor.js      # Instructor model schema
│   │   ├── Subject.js         # Subject model schema
│   │   └── Enrollment.js      # Junction table model
│   │
│   ├── controllers/
│   │   ├── studentController.js    # Student CRUD operations
│   │   ├── instructorController.js # Instructor CRUD operations
│   │   ├── subjectController.js    # Subject CRUD operations
│   │   └── enrollmentController.js # Enrollment business logic
│   │
│   ├── routes/
│   │   ├── studentRoutes.js        # /api/students routes
│   │   ├── instructorRoutes.js     # /api/instructors routes
│   │   ├── subjectRoutes.js        # /api/subjects routes
│   │   └── enrollmentRoutes.js     # /api/enrollments routes
│   │
│   └── middleware/
│       ├── logger.js          # Request logging middleware
│       ├── notFound.js        # 404 handler for undefined routes
│       └── errorHandler.js    # Global error handler (4 parameters)
│
├── src/
│   ├── postman_collection.json    # Postman test collection
│   
└── node_modules/              # Dependencies (auto-generated)
```
