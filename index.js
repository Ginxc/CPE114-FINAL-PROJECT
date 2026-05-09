require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Sequelize, DataTypes } = require('sequelize');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Logger middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Database connection
const sequelize = new Sequelize(
    process.env.DB_NAME || 'student_portal_db',
    process.env.DB_USER || 'root',
    process.env.DB_PASSWORD || '',
    {
        host: process.env.DB_HOST || 'localhost',
        dialect: 'mysql',
        logging: false
    }
);

// ============ DEFINE MODELS ============

// Student Model
const Student = sequelize.define('Student', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    studentNumber: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true
    },
    firstName: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    lastName: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    phoneNumber: {
        type: DataTypes.STRING(15),
        allowNull: true
    },
    enrollmentDate: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'students',
    timestamps: true
});

// Instructor Model
const Instructor = sequelize.define('Instructor', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    instructorNumber: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true
    },
    firstName: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    lastName: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    department: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    hireDate: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'instructors',
    timestamps: true
});

// Subject Model
const Subject = sequelize.define('Subject', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    subjectCode: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true
    },
    subjectName: {
        type: DataTypes.STRING(200),
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    units: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1,
            max: 6
        }
    },
    schedule: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    room: {
        type: DataTypes.STRING(50),
        allowNull: true
    }
}, {
    tableName: 'subjects',
    timestamps: true
});

// Enrollment Model (Junction Table)
const Enrollment = sequelize.define('Enrollment', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    studentId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'students',
            key: 'id'
        }
    },
    subjectId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'subjects',
            key: 'id'
        }
    },
    enrollmentDate: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    grade: {
        type: DataTypes.FLOAT,
        allowNull: true,
        validate: {
            min: 0,
            max: 100
        }
    },
    status: {
        type: DataTypes.ENUM('enrolled', 'dropped', 'completed'),
        defaultValue: 'enrolled'
    }
}, {
    tableName: 'enrollments',
    timestamps: true
});

// ============ SET UP ASSOCIATIONS (CRITICAL FIX) ============

// One-to-Many: Instructor teaches many Subjects
Instructor.hasMany(Subject, { 
    foreignKey: 'instructorId', 
    as: 'subjects' 
});
Subject.belongsTo(Instructor, { 
    foreignKey: 'instructorId', 
    as: 'instructor' 
});

// Many-to-Many: Students and Subjects through Enrollment
Student.belongsToMany(Subject, { 
    through: Enrollment, 
    foreignKey: 'studentId', 
    otherKey: 'subjectId',
    as: 'subjects' 
});

Subject.belongsToMany(Student, { 
    through: Enrollment, 
    foreignKey: 'subjectId', 
    otherKey: 'studentId',
    as: 'students' 
});

// One-to-Many: Student has many Enrollments
Student.hasMany(Enrollment, { 
    foreignKey: 'studentId', 
    as: 'enrollments' 
});
Enrollment.belongsTo(Student, { 
    foreignKey: 'studentId', 
    as: 'student' 
});

// One-to-Many: Subject has many Enrollments
Subject.hasMany(Enrollment, { 
    foreignKey: 'subjectId', 
    as: 'enrollments' 
});
Enrollment.belongsTo(Subject, { 
    foreignKey: 'subjectId', 
    as: 'subject' 
});

// ============ API ROUTES ============

// Health check
app.get('/health', (req, res) => {
    res.json({ success: true, message: 'API is running!' });
});

// ===== STUDENT ROUTES =====
app.get('/api/students', async (req, res) => {
    try {
        const students = await Student.findAll();
        res.json({ success: true, data: students });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/students/:id', async (req, res) => {
    try {
        const student = await Student.findByPk(req.params.id, {
            include: [
                { 
                    model: Subject, 
                    as: 'subjects',
                    through: { attributes: ['grade', 'status', 'enrollmentDate'] }
                }
            ]
        });
        if (!student) {
            return res.status(404).json({ success: false, error: 'Student not found' });
        }
        res.json({ success: true, data: student });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/students', async (req, res) => {
    try {
        const { studentNumber, firstName, lastName, email, phoneNumber } = req.body;
        if (!studentNumber || !firstName || !lastName || !email) {
            return res.status(400).json({ 
                success: false, 
                error: 'Missing required fields: studentNumber, firstName, lastName, email' 
            });
        }
        const student = await Student.create(req.body);
        res.status(201).json({ success: true, data: student });
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ success: false, error: 'Student number or email already exists' });
        }
        res.status(400).json({ success: false, error: error.message });
    }
});

app.put('/api/students/:id', async (req, res) => {
    try {
        const student = await Student.findByPk(req.params.id);
        if (!student) {
            return res.status(404).json({ success: false, error: 'Student not found' });
        }
        await student.update(req.body);
        res.json({ success: true, data: student });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

app.delete('/api/students/:id', async (req, res) => {
    try {
        const student = await Student.findByPk(req.params.id);
        if (!student) {
            return res.status(404).json({ success: false, error: 'Student not found' });
        }
        await student.destroy();
        res.json({ success: true, message: 'Student deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ===== INSTRUCTOR ROUTES =====
app.get('/api/instructors', async (req, res) => {
    try {
        const instructors = await Instructor.findAll();
        res.json({ success: true, data: instructors });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/instructors/:id', async (req, res) => {
    try {
        const instructor = await Instructor.findByPk(req.params.id, {
            include: [{ model: Subject, as: 'subjects' }]
        });
        if (!instructor) {
            return res.status(404).json({ success: false, error: 'Instructor not found' });
        }
        res.json({ success: true, data: instructor });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/instructors', async (req, res) => {
    try {
        const { instructorNumber, firstName, lastName, email, department } = req.body;
        if (!instructorNumber || !firstName || !lastName || !email || !department) {
            return res.status(400).json({ 
                success: false, 
                error: 'Missing required fields: instructorNumber, firstName, lastName, email, department' 
            });
        }
        const instructor = await Instructor.create(req.body);
        res.status(201).json({ success: true, data: instructor });
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ success: false, error: 'Instructor number or email already exists' });
        }
        res.status(400).json({ success: false, error: error.message });
    }
});

app.put('/api/instructors/:id', async (req, res) => {
    try {
        const instructor = await Instructor.findByPk(req.params.id);
        if (!instructor) {
            return res.status(404).json({ success: false, error: 'Instructor not found' });
        }
        await instructor.update(req.body);
        res.json({ success: true, data: instructor });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

app.delete('/api/instructors/:id', async (req, res) => {
    try {
        const instructor = await Instructor.findByPk(req.params.id);
        if (!instructor) {
            return res.status(404).json({ success: false, error: 'Instructor not found' });
        }
        await instructor.destroy();
        res.json({ success: true, message: 'Instructor deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ===== SUBJECT ROUTES =====
app.get('/api/subjects', async (req, res) => {
    try {
        const subjects = await Subject.findAll({
            include: [{ model: Instructor, as: 'instructor' }]
        });
        res.json({ success: true, data: subjects });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/subjects/:id', async (req, res) => {
    try {
        const subject = await Subject.findByPk(req.params.id, {
            include: [
                { model: Instructor, as: 'instructor' },
                { model: Student, as: 'students', through: { attributes: ['grade', 'status', 'enrollmentDate'] } }
            ]
        });
        if (!subject) {
            return res.status(404).json({ success: false, error: 'Subject not found' });
        }
        res.json({ success: true, data: subject });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/subjects', async (req, res) => {
    try {
        const { subjectCode, subjectName, units } = req.body;
        if (!subjectCode || !subjectName || !units) {
            return res.status(400).json({ 
                success: false, 
                error: 'Missing required fields: subjectCode, subjectName, units' 
            });
        }
        const subject = await Subject.create(req.body);
        res.status(201).json({ success: true, data: subject });
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ success: false, error: 'Subject code already exists' });
        }
        res.status(400).json({ success: false, error: error.message });
    }
});

app.put('/api/subjects/:id', async (req, res) => {
    try {
        const subject = await Subject.findByPk(req.params.id);
        if (!subject) {
            return res.status(404).json({ success: false, error: 'Subject not found' });
        }
        await subject.update(req.body);
        res.json({ success: true, data: subject });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

app.delete('/api/subjects/:id', async (req, res) => {
    try {
        const subject = await Subject.findByPk(req.params.id);
        if (!subject) {
            return res.status(404).json({ success: false, error: 'Subject not found' });
        }
        await subject.destroy();
        res.json({ success: true, message: 'Subject deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ===== ENROLLMENT ROUTES =====
app.post('/api/enrollments/enroll', async (req, res) => {
    try {
        const { studentId, subjectId } = req.body;
        
        if (!studentId || !subjectId) {
            return res.status(400).json({ 
                success: false, 
                error: 'Missing required fields: studentId, subjectId' 
            });
        }
        
        // Check if student exists
        const student = await Student.findByPk(studentId);
        if (!student) {
            return res.status(404).json({ success: false, error: 'Student not found' });
        }
        
        // Check if subject exists
        const subject = await Subject.findByPk(subjectId);
        if (!subject) {
            return res.status(404).json({ success: false, error: 'Subject not found' });
        }
        
        // Check if already enrolled
        const existing = await Enrollment.findOne({ 
            where: { studentId, subjectId } 
        });
        
        if (existing) {
            return res.status(400).json({ 
                success: false, 
                error: 'Student already enrolled in this subject' 
            });
        }
        
        // Create enrollment
        const enrollment = await Enrollment.create({ 
            studentId, 
            subjectId,
            status: 'enrolled',
            enrollmentDate: new Date()
        });
        
        res.status(201).json({ success: true, data: enrollment });
    } catch (error) {
        console.error('Enrollment error:', error);
        res.status(400).json({ success: false, error: error.message });
    }
});

app.get('/api/enrollments', async (req, res) => {
    try {
        const enrollments = await Enrollment.findAll({
            include: [
                { model: Student, as: 'student' },
                { model: Subject, as: 'subject', include: [{ model: Instructor, as: 'instructor' }] }
            ]
        });
        res.json({ success: true, data: enrollments });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/enrollments/student/:studentId', async (req, res) => {
    try {
        const enrollments = await Enrollment.findAll({
            where: { studentId: req.params.studentId },
            include: [
                { model: Subject, as: 'subject', include: [{ model: Instructor, as: 'instructor' }] }
            ]
        });
        
        if (enrollments.length === 0) {
            return res.status(404).json({ 
                success: false, 
                error: 'No enrollments found for this student' 
            });
        }
        
        res.json({ success: true, data: enrollments });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.put('/api/enrollments/grade/:studentId/:subjectId', async (req, res) => {
    try {
        const { grade } = req.body;
        
        if (grade === undefined) {
            return res.status(400).json({ success: false, error: 'Grade is required' });
        }
        
        const enrollment = await Enrollment.findOne({
            where: {
                studentId: req.params.studentId,
                subjectId: req.params.subjectId
            }
        });
        
        if (!enrollment) {
            return res.status(404).json({ success: false, error: 'Enrollment not found' });
        }
        
        await enrollment.update({ grade });
        res.json({ success: true, data: enrollment });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

app.put('/api/enrollments/drop/:studentId/:subjectId', async (req, res) => {
    try {
        const enrollment = await Enrollment.findOne({
            where: {
                studentId: req.params.studentId,
                subjectId: req.params.subjectId
            }
        });
        
        if (!enrollment) {
            return res.status(404).json({ success: false, error: 'Enrollment not found' });
        }
        
        await enrollment.update({ status: 'dropped' });
        res.json({ success: true, message: 'Student dropped from subject', data: enrollment });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// 404 handler for undefined routes
app.use('*', (req, res) => {
    res.status(404).json({ 
        success: false, 
        error: `Route not found: ${req.method} ${req.url}` 
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ 
        success: false, 
        error: 'Internal server error' 
    });
});

// ============ SYNC DATABASE AND START SERVER ============
async function startServer() {
    try {
        // Drop and recreate tables (for fresh start)
        await sequelize.sync({ alter: true });
        console.log('Database synchronized');
        
        app.listen(PORT, () => {
            console.log(`\nServer running on http://localhost:${PORT}`);
            console.log(`Test health: http://localhost:${PORT}/health`);
        });
    } catch (error) {
        console.error('✗ Failed to start server:', error.message);
    }
}

startServer();