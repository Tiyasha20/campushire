import { Router } from 'express';
import {
  applyToDrive,
  getMyApplications,
  getDriveApplicants,
  updateApplicationStatus,
} from '../controllers/applicationController.js';
import {
  authenticateToken,
  requireStudent,
  requireRole,
} from '../middleware/auth.js';
import { ROLES } from '../constants/roles.js';

const router = Router();

// Student endpoints
router.post('/apply', authenticateToken, requireStudent, applyToDrive);
router.get('/my', authenticateToken, requireStudent, getMyApplications);

// Recruiter & TPC Admin endpoints
router.get(
  '/drive/:driveId',
  authenticateToken,
  requireRole(ROLES.RECRUITER, ROLES.TPC_ADMIN),
  getDriveApplicants
);

router.patch(
  '/:applicationId/status',
  authenticateToken,
  requireRole(ROLES.RECRUITER, ROLES.TPC_ADMIN),
  updateApplicationStatus
);

export default router;