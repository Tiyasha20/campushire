import { Router } from 'express';
import { getPlacementFunnel, getDepartmentStats } from '../controllers/analyticsController.js';
import { authenticateToken, requireTPCAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/funnel', authenticateToken, requireTPCAdmin, getPlacementFunnel);
router.get('/departments', authenticateToken, requireTPCAdmin, getDepartmentStats);

export default router;