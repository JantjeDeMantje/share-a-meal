const express = require('express');
const router = express.Router();

// Example test route
router.get('/test', (req, res) => {
  res.send('Auth route works!');
});

module.exports = router;
