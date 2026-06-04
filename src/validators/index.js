import { badRequest } from '../utils/errors.js';
import {
  buildOrderRequestData,
  buildProductCreateData,
  buildProductUpdateData,
  buildStockUpdateData,
  buildWebhookReceiverPayload,
  normalizeMarketplace,
} from '../utils/marketplace.js';
import { ERROR_TYPES } from '../config/constants.js';

export const validateRegisterPayload = (req) => {
  const { name, email, password } = req.body || {};

  if (!name || !email || !password) {
    throw badRequest('name, email, and password are required');
  }

  return { name, email, password };
};

export const validateLoginPayload = (req) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    throw badRequest('email and password are required');
  }

  return { email, password };
};

export const validateMarketplaceParam = (req) => normalizeMarketplace(req.params.marketplace);

export const validateProductCreatePayload = (req) => buildProductCreateData(req.marketplace, req.body || {});

export const validateProductUpdatePayload = (req) => buildProductUpdateData(req.marketplace, req.body || {});

export const validateStockUpdatePayload = (req) => buildStockUpdateData(req.marketplace, req.body || {});

export const validateOrderPayload = (req) => buildOrderRequestData(req.marketplace, req.body || {});

export const validateWebhookPayload = (req) => buildWebhookReceiverPayload(req.params.marketplace, req.body || {});

export const validateSimulationPayload = (req) => {
  const type = req.body?.type;

  if (!Object.values(ERROR_TYPES).includes(type)) {
    throw badRequest(`Invalid simulation type. Allowed values: ${Object.values(ERROR_TYPES).join(', ')}`);
  }

  return { type };
};