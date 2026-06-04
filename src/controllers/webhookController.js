import { receiveWebhook as receiveWebhookService } from '../services/webhookService.js';

export const receiveWebhook = async (req, res, next) => {
  try {
    const result = await receiveWebhookService(req.validatedBody);

    res.status(200).json({
      success: true,
      marketplace: req.marketplace,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};