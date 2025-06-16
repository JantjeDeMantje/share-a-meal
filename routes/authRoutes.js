import express from 'express';
import authController from '../controllers/authController.js';

const router = express.Router();

// Login user
router.post('/login', authController.login);

export default router;

