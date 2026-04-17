import { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller';
import { asyncHandler } from '../../shared';
import { PaymentValidator } from '../validators/payment.validator';

export const createPaymentRoutes = (controller: PaymentController): Router => {
  const router = Router();

  // Create payment order (Razorpay)
  router.post(
    '/create-order',
    PaymentValidator.createPaymentIntent(),
    asyncHandler(controller.createPaymentIntent)
  );

  // Legacy endpoint name (for backwards compatibility)
  router.post(
    '/create-intent',
    PaymentValidator.createPaymentIntent(),
    asyncHandler(controller.createPaymentIntent)
  );

  // Confirm payment
  router.post(
    '/confirm',
    PaymentValidator.confirmPayment(),
    asyncHandler(controller.confirmPayment)
  );

  // Process refund
  router.post(
    '/refund',
    PaymentValidator.refundPayment(),
    asyncHandler(controller.refundPayment)
  );

  // Razorpay webhook endpoint
  router.post('/webhook', asyncHandler(controller.handleWebhook));

  return router;
};
