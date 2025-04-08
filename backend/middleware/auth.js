const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ message: 'Access denied. No token provided.' });

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET, {
      audience: 'time-tracker-app',
      issuer: 'time-tracker-api'
    });
    req.user = verified;
    next();
  } catch (error) {
    console.error('Token verification error:', error.message);
    res.status(401).json({ message: 'Invalid or expired token.' });
  }
};

const checkRole = (role) => {
  return (req, res, next) => {
    if (req.user.role !== role) {
      return res.status(403).json({ message: 'Access denied. Not authorized.' });
    }
    next();
  };
};

module.exports = {
  authenticateToken,
  checkRole
};
