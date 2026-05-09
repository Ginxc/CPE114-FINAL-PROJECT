const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Student = require('./Student');
const Subject = require('./Subject');

const Enrollment = sequelize.define('Enrollment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  studentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'students',
      key: 'id',
    },
  },
  subjectId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'subjects',
      key: 'id',
    },
  },
  enrollmentDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  grade: {
    type: DataTypes.FLOAT,
    allowNull: true,
    validate: {
      min: 0,
      max: 100,
    },
  },
  status: {
    type: DataTypes.ENUM('enrolled', 'dropped', 'completed'),
    defaultValue: 'enrolled',
  },
}, {
  tableName: 'enrollments',
  timestamps: true,
});

// Many-to-Many through junction model
Student.belongsToMany(Subject, { through: Enrollment, foreignKey: 'studentId', as: 'subjects' });
Subject.belongsToMany(Student, { through: Enrollment, foreignKey: 'subjectId', as: 'students' });

// Additional associations for direct access
Student.hasMany(Enrollment, { foreignKey: 'studentId', as: 'enrollments' });
Enrollment.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });
Subject.hasMany(Enrollment, { foreignKey: 'subjectId', as: 'enrollments' });
Enrollment.belongsTo(Subject, { foreignKey: 'subjectId', as: 'subject' });

module.exports = Enrollment;