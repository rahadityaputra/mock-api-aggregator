import { Router } from 'express';

import { receiveWebhook } from '../controllers/webhookController.js';
import { validateRequest } from '../middlewares/validation.js';
import { validateWebhookPayload } from '../validators/index.js';
import { normalizeMarketplace } from '../utils/marketplace.js';

const router = Router({ mergeParams: true });

router.param('marketplace', (req, res, next, value) => {
  try {
    req.marketplace = normalizeMarketplace(value);
  } catch (error) {
    error.status = 400;
    return next(error);
  }

  next();
});

router.post('/:marketplace', validateRequest(validateWebhookPayload), receiveWebhook);

export default router;