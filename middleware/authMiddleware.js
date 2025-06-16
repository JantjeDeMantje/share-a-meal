import jwt from 'jsonwebtoken';
import { sendResponse } from '../utils/responseHelper.js';

const JWT_SECRET = process.env.JWT_SECRET || 'yourSuperSecretKey';

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  // Check if the header exists and is in the correct format
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return sendResponse(res, 401, 'Access denied. No token provided.');
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return sendResponse(res, 401, 'Access denied. No token provided.');
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    return sendResponse(res, 403, 'Invalid or expired token.');
  }
};

 
