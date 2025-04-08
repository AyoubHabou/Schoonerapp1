// middleware/errorHandler.js
const errorHandler = (err, req, res, next) => {
    console.error(err.stack);
    
    // Determine status code
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    
    res.status(statusCode).json({
      message: err.message,
      stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack
    });
  };
  
  module.exports = errorHandler;