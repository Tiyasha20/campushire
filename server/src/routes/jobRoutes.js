import { Router } from 'express';
import {
  createCompany,
  createJob,
  getPendingJobs,
  approveJobAndCreateDrive,
  getActiveDrives,
} from '../controllers/jobController.js';
import {
  authenticateToken,
  requireRecruiter,
  requireTPCAdmin,
} from '../middleware/auth.js';

const router = Router();

// Public / Authenticated student routes
router.get('/drives', authenticateToken, getActiveDrives);

// Recruiter routes
router.post('/company', authenticateToken, requireRecruiter, createCompany);
router.post('/', authenticateToken, requireRecruiter, createJob);

// TPC Admin routes
router.get('/pending', authenticateToken, requireTPCAdmin, getPendingJobs);
router.patch('/approve/:jobId', authenticateToken, requireTPCAdmin, approveJobAndCreateDrive);

export default router;