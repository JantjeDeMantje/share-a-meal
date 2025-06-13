const express = require('express');
const router = express.Router();

router.get('/test', (req, res) => {
  res.send('Meal route works!');
});

module.exports = router;
