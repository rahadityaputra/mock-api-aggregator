import { Router } from 'express';

import { register, login, getMe } from '../controllers/authController.js';
import { authenticate } from '../middlewares/authentication.js';
import { validateRequest } from '../middlewares/validation.js';
import { validateLoginPayload, validateRegisterPayload } from '../validators/index.js';

const router = Router();

router.post('/register', validateRequest(validateRegisterPayload), register);
router.post('/login', validateRequest(validateLoginPayload), login);
router.get('/me', authenticate, getMe);

export default router;