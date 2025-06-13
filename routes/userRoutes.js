const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Register a new user
router.post('/register', userController.register);

// Temporary test route
router.get('/test', (req, res) => {
  res.send('User route works!');
});

module.exports = router;
