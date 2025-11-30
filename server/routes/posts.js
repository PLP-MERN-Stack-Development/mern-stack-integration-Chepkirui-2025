// posts.js - Post routes

const express = require('express');
const router = express.Router();
const {
  getAllPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  addComment,
  searchPosts,
} = require('../controllers/postController');
const { protect, authorize } = require('../middleware/auth');
const {
  postValidation,
  commentValidation,
  validate,
} = require('../middleware/validation');

// Public routes
router.get('/search', searchPosts);
router.get('/', getAllPosts);
router.get('/:id', getPost);

// Protected routes
router.post('/', protect, postValidation, validate, createPost);
router.put('/:id', protect, postValidation, validate, updatePost);
router.delete('/:id', protect, deletePost);
router.post('/:id/comments', protect, commentValidation, validate, addComment);

module.exports = router;