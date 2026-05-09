const { Instructor, Subject } = require('../models');

const getAllInstructors = async (req, res, next) => {
  try {
    const instructors = await Instructor.findAll();
    res.status(200).json({ success: true, data: instructors });
  } catch (error) {
    next(error);
  }
};

const getInstructorById = async (req, res, next) => {
  try {
    const instructor = await Instructor.findByPk(req.params.id, {
      include: [{ model: Subject, as: 'subjects' }],
    });
    
    if (!instructor) {
      return res.status(404).json({ success: false, error: 'Instructor not found' });
    }
    
    res.status(200).json({ success: true, data: instructor });
  } catch (error) {
    next(error);
  }
};

const createInstructor = async (req, res, next) => {
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
    next(error);
  }
};

const updateInstructor = async (req, res, next) => {
  try {
    const instructor = await Instructor.findByPk(req.params.id);
    
    if (!instructor) {
      return res.status(404).json({ success: false, error: 'Instructor not found' });
    }
    
    await instructor.update(req.body);
    res.status(200).json({ success: true, data: instructor });
  } catch (error) {
    next(error);
  }
};

const deleteInstructor = async (req, res, next) => {
  try {
    const instructor = await Instructor.findByPk(req.params.id);
    
    if (!instructor) {
      return res.status(404).json({ success: false, error: 'Instructor not found' });
    }
    
    await instructor.destroy();
    res.status(200).json({ success: true, message: 'Instructor deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllInstructors,
  getInstructorById,
  createInstructor,
  updateInstructor,
  deleteInstructor,
};