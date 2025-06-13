const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Register a new user
router.post('/register', userController.register);

// Get all users
router.get('/', authenticateToken, userController.getAllUsers);

module.exports = router;
