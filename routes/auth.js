// ptilms-api/routes/auth.js
import { Router } from 'express';
import { validate, validationSchemas } from '../middlewares/validationMiddleware.js';
import rateLimiter from '../middlewares/rateLimiter.js';

const createAuthRoutes = (authController) => {
  const router = Router();
  const { authLimiter } = rateLimiter;

  router.post('/register',
    validate(validationSchemas.register),
    (req, res, next) => authController.register(req, res, next)
  );

  router.post('/login',
    authLimiter,
    validate(validationSchemas.login),
    (req, res, next) => authController.login(req, res, next)
  );

  router.post('/refresh-token',
    authLimiter,
    (req, res, next) => authController.refreshToken(req, res, next)
  );

  router.post('/logout',
    (req, res, next) => authController.logout(req, res, next)
  );

  router.post('/forgot-password',
    authLimiter,
    validate([validationSchemas.login[0]]), // Use email validation from login schema
    (req, res, next) => authController.forgotPassword(req, res, next)
  );

  router.post('/reset-password/:token',
    authLimiter,
    validate([validationSchemas.register[2]]), // Use password validation from register schema
    (req, res, next) => authController.resetPassword(req, res, next)
  );

  router.post('/verify-email/:token',
    (req, res, next) => authController.verifyEmail(req, res, next)
  );

  router.post('/resend-verification',
    authLimiter,
    validate([validationSchemas.login[0]]), // Use email validation from login schema
    (req, res, next) => authController.resendVerification(req, res, next)
  );

  return router;
};

export default createAuthRoutes;