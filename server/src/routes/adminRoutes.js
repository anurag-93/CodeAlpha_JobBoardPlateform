import express from 'express';
import {
  getPlatformStats,
  getAllUsers,
  toggleUserStatus,
  deleteUser,
  getAllJobsAdmin,
  updateJobStatusAdmin,
} from '../controllers/adminController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect, authorize('admin'));

router.get('/stats', getPlatformStats);
router.get('/users', getAllUsers);
router.patch('/users/:id/toggle-status', toggleUserStatus);
router.delete('/users/:id', deleteUser);

router.get('/jobs', getAllJobsAdmin);
router.patch('/jobs/:id/status', updateJobStatusAdmin);

export default router;
