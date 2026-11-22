import express from 'express';
import {
  getJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  getEmployerJobs,
  getEmployerStats,
} from '../controllers/jobController.js';
import { protect, optionalProtect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Employer specific routes
router.get('/employer/my-jobs', protect, authorize('employer', 'admin'), getEmployerJobs);
router.get('/employer/stats', protect, authorize('employer', 'admin'), getEmployerStats);

// Public & General job routes
router.get('/', getJobs);
router.get('/:id', optionalProtect, getJobById);
router.post('/', protect, authorize('employer', 'admin'), createJob);
router.put('/:id', protect, authorize('employer', 'admin'), updateJob);
router.delete('/:id', protect, authorize('employer', 'admin'), deleteJob);

export default router;
