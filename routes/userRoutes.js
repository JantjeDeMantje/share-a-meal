const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const checkOwnership = require('../middleware/checkOwnership');
const { authenticateToken } = require('../middleware/authMiddleware');

// Register a new user
router.post('/register', userController.register);

// Get all users
router.get('/', authenticateToken, userController.getAllUsers);

// //Update user details
router.put('/:id', authenticateToken, checkOwnership, userController.updateUser);

// Delete a user
router.delete('/:id', authenticateToken, checkOwnership, userController.deleteUser);

module.exports = router;
