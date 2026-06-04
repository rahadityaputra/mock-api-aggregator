import { setMarketplaceSimulation } from '../services/simulationService.js';

export const simulateError = async (req, res, next) => {
  try {
    const { type } = req.validatedBody;
    const result = setMarketplaceSimulation(req.marketplace, type);

    res.status(200).json({
      success: true,
      marketplace: req.marketplace,
      simulation: result,
    });
  } catch (error) {
    next(error);
  }
};