const express = require('express');
const router = express.Router();
const workoutController = require('../controllers/workout.controller');
const { authenticate, authorizeAdmin } = require('../middlewares/auth.middleware');
const {
    categoryValidation,
    muscleValidation,
    subMuscleValidation,
    exerciseValidation,
    idParamValidation
} = require('../middlewares/validation.middleware');

// --- Public/Member Routes (Discovery) ---
router.get('/categories', authenticate, workoutController.getCategories);
router.get('/muscles/:categoryId', authenticate, workoutController.getMuscles);
router.get('/submuscles/:muscleId', authenticate, workoutController.getSubMuscles);
router.get('/exercises/:subMuscleId', authenticate, workoutController.getExercises);

// --- Favorites & Logs ---
router.get('/favorites', authenticate, workoutController.getFavorites);
router.post('/favorites', authenticate, workoutController.addFavorite);
router.delete('/favorites/:id', authenticate, idParamValidation, workoutController.removeFavorite);
router.post('/workout-log', authenticate, workoutController.logWorkout);
router.get('/workout-log/today', authenticate, workoutController.getTodayLogs);

// --- Admin CRUD ---
router.post('/categories', authenticate, authorizeAdmin, categoryValidation, workoutController.createCategory);
router.put('/categories/:id', authenticate, authorizeAdmin, [...idParamValidation, ...categoryValidation], workoutController.updateCategory);
router.delete('/categories/:id', authenticate, authorizeAdmin, idParamValidation, workoutController.deleteCategory);

router.post('/muscles', authenticate, authorizeAdmin, muscleValidation, workoutController.createMuscle);
router.put('/muscles/:id', authenticate, authorizeAdmin, [...idParamValidation, ...muscleValidation], workoutController.updateMuscle);
router.delete('/muscles/:id', authenticate, authorizeAdmin, idParamValidation, workoutController.deleteMuscle);

router.post('/submuscles', authenticate, authorizeAdmin, subMuscleValidation, workoutController.createSubMuscle);
router.put('/submuscles/:id', authenticate, authorizeAdmin, [...idParamValidation, ...subMuscleValidation], workoutController.updateSubMuscle);
router.delete('/submuscles/:id', authenticate, authorizeAdmin, idParamValidation, workoutController.deleteSubMuscle);

router.post('/exercises', authenticate, authorizeAdmin, exerciseValidation, workoutController.createExercise);
router.put('/exercises/:id', authenticate, authorizeAdmin, [...idParamValidation, ...exerciseValidation], workoutController.updateExercise);
router.delete('/exercises/:id', authenticate, authorizeAdmin, idParamValidation, workoutController.deleteExercise);

module.exports = router;