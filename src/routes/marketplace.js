import { Router } from "express";

import {
    createProduct,
    deleteProduct,
    getProduct,
    listProducts,
    updateProduct,
    updateProductStock,
} from "../controllers/productController.js";
import {
    createOrder,
    getOrder,
    listOrders,
} from "../controllers/orderController.js";
import { simulateError } from "../controllers/marketplaceController.js";
import { authenticate } from "../middlewares/authentication.js";
import { authorizeInternalRequest } from "../middlewares/internalAuthentication.js";
import { validateRequest } from "../middlewares/validation.js";
import {
    validateOrderPayload,
    validateProductCreatePayload,
    validateProductUpdatePayload,
    validateSimulationPayload,
    validateStockUpdatePayload,
} from "../validators/index.js";
import { AppError } from "../utils/errors.js";
import { normalizeMarketplace } from "../utils/marketplace.js";

const router = Router({ mergeParams: true });

router.use((req, res, next) => {
    try {
        const { marketplace } = req.params;

        if (!marketplace) {
            throw new AppError(400, "Missing marketplace");
        }

        req.marketplace = normalizeMarketplace(marketplace);
        return next();
    } catch (error) {
        error.status = 400;
        next(error);
    }
});

router.get("/products", listProducts);
router.get("/products/:id", getProduct);
router.post(
    "/products",
    authorizeInternalRequest,
    validateRequest(validateProductCreatePayload),
    createProduct,
);
router.patch(
    "/products/:id",
    authorizeInternalRequest,
    validateRequest(validateProductUpdatePayload),
    updateProduct,
);
router.delete("/products/:id", authorizeInternalRequest, deleteProduct);
router.patch(
    "/products/:id/stock",
    authorizeInternalRequest,
    validateRequest(validateStockUpdatePayload),
    updateProductStock,
);

router.post(
    "/orders",
    authenticate,
    validateRequest(validateOrderPayload),
    createOrder,
);
router.get("/my-orders", authenticate, listOrders);
router.get("/orders/:id", authenticate, getOrder);

router.post(
    "/simulate-error",
    authenticate,
    validateRequest(validateSimulationPayload),
    simulateError,
);

export default router;
