import axios from 'axios';

import { DEFAULT_WEBHOOK_BASE_URL, ERROR_TYPES } from '../config/constants.js';
import { createWebhookLog } from '../repositories/webhookLogRepository.js';
import { buildWebhookPayload, normalizeMarketplace } from '../utils/marketplace.js';
import { consumeMarketplaceSimulation } from './simulationService.js';

const webhookTimeout = Number(process.env.WEBHOOK_TIMEOUT_MS || 5000);

export const recordWebhookLog = async (data) => createWebhookLog(data);

export const sendOrderWebhook = async (order, item, product) => {
  const marketplace = normalizeMarketplace(order.marketplace);
  const simulation = consumeMarketplaceSimulation(marketplace);

  const payload = buildWebhookPayload(order, item, product);
  const webhookUrl = `${DEFAULT_WEBHOOK_BASE_URL}/${marketplace}`;

  console.log(`[WEBHOOK_SENDING] Sending ORDER_CREATED webhook to ${marketplace.toUpperCase()} - URL: ${webhookUrl}`, { payload });

  if (simulation?.type === ERROR_TYPES.WEBHOOK_FAILED) {
    console.warn(`[WEBHOOK_SIMULATED_FAILURE] Simulated failure requested for ${marketplace.toUpperCase()}`);
    await recordWebhookLog({
      marketplace,
      event_type: 'ORDER_CREATED',
      payload,
      status: 'FAILED',
    });

    return { status: 'FAILED', reason: 'Webhook simulation requested failure', webhookUrl };
  }

  if (simulation?.type === ERROR_TYPES.TIMEOUT) {
    console.warn(`[WEBHOOK_SIMULATED_TIMEOUT] Simulated timeout requested for ${marketplace.toUpperCase()}`);
    await recordWebhookLog({
      marketplace,
      event_type: 'ORDER_CREATED',
      payload,
      status: 'TIMEOUT',
    });

    return { status: 'TIMEOUT', reason: 'Webhook request timed out by simulation', webhookUrl };
  }

  try {
    const response = await axios.post(webhookUrl, payload, {
      timeout: webhookTimeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const status = response.status >= 200 && response.status < 300 ? 'SUCCESS' : 'FAILED';

    console.log(`[WEBHOOK_SENT_SUCCESS] Webhook response received from ${marketplace.toUpperCase()} - Status: ${response.status}`);

    await recordWebhookLog({
      marketplace,
      event_type: 'ORDER_CREATED',
      payload,
      status,
    });

    return { status, webhookUrl };
  } catch (error) {
    console.error(`[WEBHOOK_SENT_ERROR] Failed to send webhook to ${marketplace.toUpperCase()} - Error: ${error.message}`);
    await recordWebhookLog({
      marketplace,
      event_type: 'ORDER_CREATED',
      payload,
      status: 'FAILED',
    });

    return { status: 'FAILED', reason: error.message, webhookUrl };
  }
};

export const receiveWebhook = async (webhookData) => {
  const log = await recordWebhookLog(webhookData);

  return {
    received: true,
    log,
  };
};