import express from 'express';
import userController from '../controllers/userController.js';
import checkOwnership from '../middleware/checkOwnership.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Register a new user
router.post('/register', userController.register);

// Get all users
router.get('/', authenticateToken, userController.getAllUsers);

// Update user details
router.put('/:id', authenticateToken, checkOwnership, userController.updateUser);

// Delete a user
router.delete('/:id', authenticateToken, checkOwnership, userController.deleteUser);

export default router;
