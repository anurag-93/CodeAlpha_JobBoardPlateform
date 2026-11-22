import express from 'express';
import {
  applyToJob,
  getMyApplications,
  getJobApplicants,
  getAllEmployerApplications,
  getApplicationById,
  updateApplicationStatus,
  updateEmployerNotes,
} from '../controllers/applicationController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);

// Candidate routes
router.post('/', authorize('candidate'), applyToJob);
router.get('/my-applications', authorize('candidate'), getMyApplications);

// Employer routes
router.get('/job/:jobId', authorize('employer', 'admin'), getJobApplicants);
router.get('/employer/all', authorize('employer', 'admin'), getAllEmployerApplications);
router.patch('/:id/status', authorize('employer', 'admin'), updateApplicationStatus);
router.patch('/:id/notes', authorize('employer', 'admin'), updateEmployerNotes);

// Common / Specific application details
router.get('/:id', getApplicationById);

export default router;
