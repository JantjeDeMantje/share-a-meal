const express = require('express');
const router = express.Router();
const mealController = require('../controllers/mealController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.get('/my-meals', authenticateToken, mealController.getMealsByCook);
router.get('/user/:userId', mealController.getMealsByUserId);

router.post('/', authenticateToken, mealController.createMeal);
router.put('/:id', authenticateToken, mealController.updateMeal);
router.get('/', authenticateToken, mealController.getAllMeals);
router.get('/:id', authenticateToken, mealController.getMealById);
router.delete('/:id', authenticateToken, mealController.deleteMeal);

module.exports = router;
