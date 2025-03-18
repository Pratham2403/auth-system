import express from 'express';
import {
  getUsers,
  getUser,
  updateProfile,
  updatePassword,
  deleteAccount
} from '../controllers/userController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Protect all routes
router.use(protect);

// User profile routes
router.put('/profile', updateProfile);
router.put('/password', updatePassword);
router.delete('/', deleteAccount);

// Admin routes
router.get('/', authorize('admin'), getUsers);
router.get('/:id', authorize('admin'), getUser);

export default router;