import { ERROR_TYPES } from '../config/constants.js';
import { badRequest } from '../utils/errors.js';
import { normalizeMarketplace } from '../utils/marketplace.js';

const simulationState = new Map();

export const setMarketplaceSimulation = (marketplace, type) => {
  const normalized = normalizeMarketplace(marketplace);

  if (!Object.values(ERROR_TYPES).includes(type)) {
    throw badRequest(`Invalid simulation type: ${type}`);
  }

  simulationState.set(normalized, { type, createdAt: new Date().toISOString() });

  return simulationState.get(normalized);
};

export const consumeMarketplaceSimulation = (marketplace) => {
  const normalized = normalizeMarketplace(marketplace);
  const payload = simulationState.get(normalized) || null;

  if (payload) {
    simulationState.delete(normalized);
  }

  return payload;
};

export const clearMarketplaceSimulation = (marketplace) => {
  const normalized = normalizeMarketplace(marketplace);
  simulationState.delete(normalized);
};

export const getSimulationStore = () => simulationState;