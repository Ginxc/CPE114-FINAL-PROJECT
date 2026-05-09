const { Student, Enrollment, Subject } = require('../models');

// GET all students
const getAllStudents = async (req, res, next) => {
  try {
    const students = await Student.findAll();
    res.status(200).json({ success: true, data: students });
  } catch (error) {
    next(error);
  }
};

// GET student by ID with enrolled subjects
const getStudentById = async (req, res, next) => {
  try {
    const student = await Student.findByPk(req.params.id, {
      include: [
        {
          model: Subject,
          as: 'subjects',
          through: { attributes: ['grade', 'status', 'enrollmentDate'] },
        },
      ],
    });
    
    if (!student) {
      return res.status(404).json({ success: false, error: 'Student not found' });
    }
    
    res.status(200).json({ success: true, data: student });
  } catch (error) {
    next(error);
  }
};

// CREATE student
const createStudent = async (req, res, next) => {
  try {
    const { studentNumber, firstName, lastName, email, phoneNumber } = req.body;
    
    // Validation
    if (!studentNumber || !firstName || !lastName || !email) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: studentNumber, firstName, lastName, email' 
      });
    }
    
    const student = await Student.create({
      studentNumber,
      firstName,
      lastName,
      email,
      phoneNumber,
    });
    
    res.status(201).json({ success: true, data: student });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ success: false, error: 'Student number or email already exists' });
    }
    next(error);
  }
};

// UPDATE student
const updateStudent = async (req, res, next) => {
  try {
    const student = await Student.findByPk(req.params.id);
    
    if (!student) {
      return res.status(404).json({ success: false, error: 'Student not found' });
    }
    
    await student.update(req.body);
    res.status(200).json({ success: true, data: student });
  } catch (error) {
    next(error);
  }
};

// DELETE student
const deleteStudent = async (req, res, next) => {
  try {
    const student = await Student.findByPk(req.params.id);
    
    if (!student) {
      return res.status(404).json({ success: false, error: 'Student not found' });
    }
    
    await student.destroy();
    res.status(200).json({ success: true, message: 'Student deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
};