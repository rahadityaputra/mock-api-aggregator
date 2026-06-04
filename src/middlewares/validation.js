export const validateRequest = (validator) => {
  return (req, res, next) => {
    try {
      req.validatedBody = validator(req);
      next();
    } catch (error) {
      next(error);
    }
  };
};