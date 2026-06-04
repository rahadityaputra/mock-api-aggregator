import { createOrder as createOrderService, getMyOrders, getOrderById } from '../services/orderService.js';

export const createOrder = async (req, res, next) => {
  try {
    const result = await createOrderService({
      marketplace: req.marketplace,
      userId: req.user.id,
      ...req.validatedBody,
    });

    console.log('Order created:', result.order);
    res.status(201).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

export const listOrders = async (req, res, next) => {
  try {
    const orders = await getMyOrders(req.user.id, req.marketplace);
    res.status(200).json({ success: true, orders });
  } catch (error) {
    next(error);
  }
};

export const getOrder = async (req, res, next) => {
  try {
    const order = await getOrderById(req.user.id, req.params.id, req.marketplace);
    res.status(200).json({ success: true, order });
  } catch (error) {
    next(error);
  }
};