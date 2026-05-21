import axios from 'axios';
import { webhookConfigs } from '../models/WebhookConfig.js';
import { WEBHOOK_EVENTS } from '../config/constants.js';

const WEBHOOK_TIMEOUT_MS = parseInt(process.env.WEBHOOK_TIMEOUT_MS || '5000', 10);

/**
 * Build the standard webhook payload envelope.
 *
 * @param {string} marketplace
 * @param {string} event       - WEBHOOK_EVENTS constant
 * @param {object} data        - Event-specific data
 * @returns {object} Payload ready to POST
 */
const buildPayload = (marketplace, event, data) => ({
  event,
  marketplace,
  timestamp: new Date().toISOString(),
  data,
});

/**
 * Deliver a webhook to the configured URL for a marketplace.
 * Errors are caught and logged — they do not bubble up to the caller.
 *
 * @param {string} marketplace
 * @param {string} event
 * @param {object} data
 * @returns {Promise<{ delivered: boolean, statusCode?: number, error?: string }>}
 */
export const deliverWebhook = async (marketplace, event, data) => {
  const config = webhookConfigs[marketplace];

  if (!config || !config.enabled || !config.url) {
    console.log(`[WEBHOOK] Skipped: No enabled config for ${marketplace}`);
    return { delivered: false, error: 'No webhook URL configured' };
  }

  // Only fire if the event is subscribed to
  if (config.events && !config.events.includes(event)) {
    console.log(`[WEBHOOK] Skipped: Event "${event}" not in subscription list for ${marketplace}`);
    return { delivered: false, error: `Event "${event}" not subscribed` };
  }

  const payload = buildPayload(marketplace, event, data);

  console.log(`[WEBHOOK] Delivering "${event}" to ${config.url} for ${marketplace}...`);

  try {
    const response = await axios.post(config.url, payload, {
      timeout: WEBHOOK_TIMEOUT_MS,
      headers: {
        'Content-Type': 'application/json',
        'X-Marketplace': marketplace,
        'X-Webhook-Event': event,
        'X-Webhook-Secret': config.secret || '',
        'User-Agent': 'MockMarketplaceAPI/1.0',
      },
    });

    console.log(`[WEBHOOK] Delivered successfully. Status: ${response.status}`);
    return { delivered: true, statusCode: response.status };
  } catch (err) {
    const statusCode = err.response?.status;
    const errorMsg = err.message || 'Unknown webhook delivery error';
    console.error(`[WEBHOOK] Delivery failed for ${marketplace}: ${errorMsg}`);
    return { delivered: false, statusCode, error: errorMsg };
  }
};

/**
 * Fire the order.created webhook after a successful order.
 * Non-blocking — awaited internally but not by the caller.
 *
 * @param {string} marketplace
 * @param {object} order - The created order record
 */
export const triggerOrderWebhook = (marketplace, order) => {
  // Fire and forget — intentionally not awaited by the caller
  deliverWebhook(marketplace, WEBHOOK_EVENTS.ORDER_CREATED, { order })
    .catch((err) => {
      console.error('[WEBHOOK] Unexpected error in triggerOrderWebhook:', err.message);
    });
};

/**
 * Send a test webhook to verify the configured URL is reachable.
 *
 * @param {string} marketplace
 * @returns {Promise<object>} Delivery result
 */
export const sendTestWebhook = async (marketplace) => {
  const testData = {
    message: 'This is a test webhook from the Mock Marketplace API',
    marketplace,
    sentAt: new Date().toISOString(),
  };

  return deliverWebhook(marketplace, WEBHOOK_EVENTS.TEST, testData);
};

/**
 * Update (or create) the webhook configuration for a marketplace.
 *
 * @param {string} marketplace
 * @param {object} configUpdate - { url, secret, events, enabled }
 * @returns {object} Updated config (without secret)
 */
export const configureWebhook = (marketplace, configUpdate) => {
  const current = webhookConfigs[marketplace] || {};

  webhookConfigs[marketplace] = {
    ...current,
    ...configUpdate,
    configuredAt: new Date().toISOString(),
  };

  const { secret, ...safeConfig } = webhookConfigs[marketplace];
  return safeConfig;
};

/**
 * Get the current webhook config for a marketplace (without secret).
 *
 * @param {string} marketplace
 * @returns {object}
 */
export const getWebhookConfig = (marketplace) => {
  const config = webhookConfigs[marketplace];
  if (!config) return null;
  const { secret, ...safeConfig } = config;
  return safeConfig;
};
