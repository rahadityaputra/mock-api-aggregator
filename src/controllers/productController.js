import {
  createProduct as createProductService,
  deleteProduct as deleteProductService,
  getProduct as getProductService,
  listProducts as listProductsService,
  updateProduct as updateProductService,
  updateProductStock as updateProductStockService,
} from '../services/productService.js';

export const listProducts = async (req, res, next) => {
  try {
    const data = await listProductsService(req.marketplace, req.query);
    res.status(200).json({ success: true, ...data });
  } catch (error) {
    next(error);
  }
};

export const getProduct = async (req, res, next) => {
  try {
    const product = await getProductService(req.marketplace, req.params.id);
    res.status(200).json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    console.log('[PRODUCT_CREATE_REQUEST]', {
      marketplace: req.marketplace,
      body: req.body,
    });

    const product = await createProductService({
      ...req.validatedBody,
      marketplace: req.marketplace,
    });

    res.status(201).json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const product = await updateProductService(req.marketplace, req.params.id, req.validatedBody);
    res.status(200).json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const product = await deleteProductService(req.marketplace, req.params.id);
    res.status(200).json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

export const updateProductStock = async (req, res, next) => {
  try {
    const product = await updateProductStockService(req.marketplace, req.params.id, req.validatedBody);
    res.status(200).json({ success: true, product });
  } catch (error) {
    next(error);
  }
};