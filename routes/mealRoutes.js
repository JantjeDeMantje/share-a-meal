import express from 'express';
import mealController from '../controllers/mealController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get user's meals
router.get('/my-meals', authenticateToken, mealController.getMealsByCook);
// Get meals by user ID
router.get('/user/:userId', mealController.getMealsByUserId);

// Create, update, get, and delete meals
router.post('/', authenticateToken, mealController.createMeal);
router.put('/:id', authenticateToken, mealController.updateMeal);
router.get('/', authenticateToken, mealController.getAllMeals);
router.get('/:id', authenticateToken, mealController.getMealById);
router.delete('/:id', authenticateToken, mealController.deleteMeal);

export default router;
