import express from 'express';
import userController from '../controllers/userController.js';
import checkOwnership from '../middleware/checkOwnership.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', userController.register);

router.get('/', authenticateToken, userController.getAllUsers);

router.put('/:id', authenticateToken, checkOwnership, userController.updateUser);

router.delete('/:id', authenticateToken, checkOwnership, userController.deleteUser);

export default router;
