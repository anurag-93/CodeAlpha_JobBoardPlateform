import express from 'express';
import {
  uploadResume as uploadResumeController,
  getMyResumes,
  setDefaultResume,
  deleteResume,
  getResumeFile,
} from '../controllers/resumeController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import { uploadResume } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.use(protect);

router.post(
  '/',
  authorize('candidate'),
  uploadResume.single('resume'),
  uploadResumeController
);

router.get('/', authorize('candidate'), getMyResumes);
router.put('/:id/default', authorize('candidate'), setDefaultResume);
router.delete('/:id', authorize('candidate', 'admin'), deleteResume);

// View / download resume with permission verification
router.get('/:id/download', getResumeFile);

export default router;
