const jwt = require('jsonwebtoken');
const { sendResponse } = require('../utils/responseHelper');

const JWT_SECRET = process.env.JWT_SECRET || 'yourSuperSecretKey';

exports.authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  
  // Authorization: Bearer <token>
  const token = authHeader.split(' ')[1];
  
  if (!token) {
    return sendResponse(res, 401, 'Access denied. No token provided.');
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next(); // continue to the protected route
  } catch (err) {
    return sendResponse(res, 403, 'Invalid or expired token.');
  }
};

 
