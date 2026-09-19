import { Router } from 'express';
import { uploadResumeVersion, analyzeDriveMatch,getMyResumes } from '../controllers/resumeController.js';
import { authenticateToken, requireStudent } from '../middleware/auth.js';
import { uploadResume } from '../utils/fileUpload.js';

const router = Router();
router.get('/my', authenticateToken, requireStudent, getMyResumes);
router.post(
  '/upload',
  authenticateToken,
  requireStudent,
  uploadResume.single('resume'),
  uploadResumeVersion
);

router.post('/analyze', authenticateToken, requireStudent, analyzeDriveMatch);

export default router;