import { forbidden, unauthorized } from "../utils/errors.js";

const getInternalApiKey = () =>
    process.env.INTERNAL_API_KEY || "dev-internal-key";

export const authorizeInternalRequest = (req, res, next) => {
    const providedKey = req.headers["x-internal-secret"];

    if (!providedKey) {
        return next(unauthorized("Missing internal secret"));
    }

    if (providedKey !== getInternalApiKey()) {
        return next(forbidden("Invalid internal secret"));
    }

    return next();
};
