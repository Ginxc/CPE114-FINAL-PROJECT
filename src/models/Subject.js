const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Instructor = require('./Instructor');

const Subject = sequelize.define('Subject', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  subjectCode: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
  },
  subjectName: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  units: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 6,
    },
  },
  schedule: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  room: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
}, {
  tableName: 'subjects',
  timestamps: true,
});

// One-to-Many: Instructor teaches many Subjects
Instructor.hasMany(Subject, { foreignKey: 'instructorId', as: 'subjects' });
Subject.belongsTo(Instructor, { foreignKey: 'instructorId', as: 'instructor' });

module.exports = Subject;