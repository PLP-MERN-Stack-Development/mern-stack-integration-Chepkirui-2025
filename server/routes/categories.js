// categories.js - Category routes

const express = require('express');
const router = express.Router();
const {
  getAllCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController');
const { protect, authorize } = require('../middleware/auth');
const { categoryValidation, validate } = require('../middleware/validation');

// Public routes
router.get('/', getAllCategories);
router.get('/:id', getCategory);

// Protected routes (admin only for create, update, delete)
router.post(
  '/',
  protect,
  authorize('admin'),
  categoryValidation,
  validate,
  createCategory
);
router.put(
  '/:id',
  protect,
  authorize('admin'),
  categoryValidation,
  validate,
  updateCategory
);
router.delete('/:id', protect, authorize('admin'), deleteCategory);

module.exports = router;