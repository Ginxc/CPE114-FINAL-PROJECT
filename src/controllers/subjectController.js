const { Subject, Instructor, Student } = require('../models');

const getAllSubjects = async (req, res, next) => {
  try {
    const subjects = await Subject.findAll({
      include: [{ model: Instructor, as: 'instructor' }],
    });
    res.status(200).json({ success: true, data: subjects });
  } catch (error) {
    next(error);
  }
};

const getSubjectById = async (req, res, next) => {
  try {
    const subject = await Subject.findByPk(req.params.id, {
      include: [
        { model: Instructor, as: 'instructor' },
        { model: Student, as: 'students', through: { attributes: ['grade', 'status'] } },
      ],
    });
    
    if (!subject) {
      return res.status(404).json({ success: false, error: 'Subject not found' });
    }
    
    res.status(200).json({ success: true, data: subject });
  } catch (error) {
    next(error);
  }
};

const createSubject = async (req, res, next) => {
  try {
    const { subjectCode, subjectName, units, instructorId, description, schedule, room } = req.body;
    
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
    next(error);
  }
};

const updateSubject = async (req, res, next) => {
  try {
    const subject = await Subject.findByPk(req.params.id);
    
    if (!subject) {
      return res.status(404).json({ success: false, error: 'Subject not found' });
    }
    
    await subject.update(req.body);
    res.status(200).json({ success: true, data: subject });
  } catch (error) {
    next(error);
  }
};

const deleteSubject = async (req, res, next) => {
  try {
    const subject = await Subject.findByPk(req.params.id);
    
    if (!subject) {
      return res.status(404).json({ success: false, error: 'Subject not found' });
    }
    
    await subject.destroy();
    res.status(200).json({ success: true, message: 'Subject deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllSubjects,
  getSubjectById,
  createSubject,
  updateSubject,
  deleteSubject,
};