const errorHandler = (err, req, res, next) => {
  console.error('Error:', err.message);
  
  // Sequelize validation error
  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      success: false,
      error: err.errors.map(e => e.message).join(', ')
    });
  }
  
  // Server error
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
};

module.exports = errorHandler;