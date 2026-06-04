import fs from "node:fs";
import path from "node:path";

import multer from "multer";

import { PRODUCT_IMAGE_RULES } from "../config/constants.js";

const uploadsDir = path.resolve("uploads/products");

if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (_req, _file, callback) => callback(null, uploadsDir),
    filename: (_req, file, callback) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const extension = path.extname(file.originalname).toLowerCase();
        callback(null, `${uniqueSuffix}${extension}`);
    },
});

const fileFilter = (_req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();

    if (!PRODUCT_IMAGE_RULES.allowedExtensions.includes(extension)) {
        return callback(
            new Error("Invalid image format. Allowed: jpg, jpeg, png, webp"),
        );
    }

    if (!PRODUCT_IMAGE_RULES.allowedMimeTypes.includes(file.mimetype)) {
        return callback(
            new Error("Invalid image mime type. Allowed: jpg, jpeg, png, webp"),
        );
    }

    return callback(null, true);
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: PRODUCT_IMAGE_RULES.maxSizeBytes,
        files: PRODUCT_IMAGE_RULES.maxCount,
    },
});

export const uploadProductImages = (req, res, next) => {
    if (!req.is("multipart/form-data")) {
        return next();
    }

    return upload.array("images", PRODUCT_IMAGE_RULES.maxCount)(
        req,
        res,
        (error) => {
            if (error) {
                error.status = 400;
                error.statusCode = 400;
                return next(error);
            }

            return next();
        },
    );
};
