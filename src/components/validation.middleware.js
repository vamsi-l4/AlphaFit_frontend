const { body, param } = require('express-validator');

exports.categoryValidation = [
    body('name').trim().notEmpty().withMessage('Name is required').isLength({ min: 3 }).withMessage('Min 3 characters')
];

exports.muscleValidation = [
    body('name').trim().notEmpty().withMessage('Name is required').isLength({ min: 3 }).withMessage('Min 3 characters'),
    body('categoryId').isInt().withMessage('Valid Category ID is required')
];

exports.subMuscleValidation = [
    body('name').trim().notEmpty().withMessage('Name is required').isLength({ min: 3 }).withMessage('Min 3 characters'),
    body('muscleId').isInt().withMessage('Valid Muscle ID is required')
];

exports.exerciseValidation = [
    body('name').trim().notEmpty().withMessage('Name is required').isLength({ min: 3 }).withMessage('Min 3 characters'),
    body('equipment').notEmpty().withMessage('Equipment is required'),
    body('steps').notEmpty().withMessage('Steps are required').isLength({ min: 10 }).withMessage('Steps must be descriptive'),
    body('subMuscleId').isInt().withMessage('Valid SubMuscle ID is required'),
    body('videoUrl').optional({ checkFalsy: true }).isURL().withMessage('Must be a valid URL')
];

exports.idParamValidation = [
    param('id').isInt().withMessage('Invalid ID parameter')
];