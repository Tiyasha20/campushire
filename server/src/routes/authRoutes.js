import { Router } from 'express';
import { register,registerRecruiter, login } from '../controllers/authController.js';

const router = Router();

router.post('/register', register);
router.post('/register/recruiter', registerRecruiter);
router.post('/login', login);

export default router;