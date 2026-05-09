const { Enrollment, Student, Subject } = require('../models');

// Relationship-specific endpoint: Enroll student in subject
const enrollStudent = async (req, res, next) => {
  try {
    const { studentId, subjectId } = req.body;
    
    if (!studentId || !subjectId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: studentId, subjectId' 
      });
    }
    
    // Check if student and subject exist
    const student = await Student.findByPk(studentId);
    const subject = await Subject.findByPk(subjectId);
    
    if (!student || !subject) {
      return res.status(404).json({ 
        success: false, 
        error: 'Student or Subject not found' 
      });
    }
    
    // Check if already enrolled
    const existing = await Enrollment.findOne({ where: { studentId, subjectId } });
    if (existing) {
      return res.status(400).json({ 
        success: false, 
        error: 'Student already enrolled in this subject' 
      });
    }
    
    const enrollment = await Enrollment.create({ studentId, subjectId });
    res.status(201).json({ success: true, data: enrollment });
  } catch (error) {
    next(error);
  }
};

// Relationship-specific endpoint: Get all enrollments with details
const getAllEnrollments = async (req, res, next) => {
  try {
    const enrollments = await Enrollment.findAll({
      include: [
        { model: Student, as: 'student' },
        { model: Subject, as: 'subject', include: [{ model: require('../models').Instructor, as: 'instructor' }] },
      ],
    });
    res.status(200).json({ success: true, data: enrollments });
  } catch (error) {
    next(error);
  }
};

// Get student's enrolled subjects
const getStudentEnrollments = async (req, res, next) => {
  try {
    const enrollments = await Enrollment.findAll({
      where: { studentId: req.params.studentId },
      include: [{ model: Subject, as: 'subject' }],
    });
    
    if (enrollments.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'No enrollments found for this student' 
      });
    }
    
    res.status(200).json({ success: true, data: enrollments });
  } catch (error) {
    next(error);
  }
};

// Drop student from subject
const dropEnrollment = async (req, res, next) => {
  try {
    const enrollment = await Enrollment.findOne({
      where: { 
        studentId: req.params.studentId, 
        subjectId: req.params.subjectId 
      },
    });
    
    if (!enrollment) {
      return res.status(404).json({ 
        success: false, 
        error: 'Enrollment not found' 
      });
    }
    
    await enrollment.update({ status: 'dropped' });
    res.status(200).json({ success: true, message: 'Student dropped from subject successfully' });
  } catch (error) {
    next(error);
  }
};

// Update grade
const updateGrade = async (req, res, next) => {
  try {
    const { grade } = req.body;
    const enrollment = await Enrollment.findOne({
      where: { 
        studentId: req.params.studentId, 
        subjectId: req.params.subjectId 
      },
    });
    
    if (!enrollment) {
      return res.status(404).json({ 
        success: false, 
        error: 'Enrollment not found' 
      });
    }
    
    await enrollment.update({ grade });
    res.status(200).json({ success: true, data: enrollment });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  enrollStudent,
  getAllEnrollments,
  getStudentEnrollments,
  dropEnrollment,
  updateGrade,
};