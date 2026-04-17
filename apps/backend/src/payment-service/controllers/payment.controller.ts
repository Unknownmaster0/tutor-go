import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { PaymentService } from '../services/payment.service';
import { ApiResponse } from '../../shared';
import crypto from 'crypto';

export class PaymentController {
  constructor(private paymentService: PaymentService) {}

  createPaymentIntent = async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        ApiResponse.error(res, 'Validation failed', 400, errors.array());
        return;
      }

      const result = await this.paymentService.createPaymentIntent(req.body);
      ApiResponse.success(res, result, 'Payment order created successfully', 201);
    } catch (error: any) {
      console.error('Error creating payment order:', error);
      ApiResponse.error(res, error.message || 'Failed to create payment order', 500);
    }
  };

  confirmPayment = async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        ApiResponse.error(res, 'Validation failed', 400, errors.array());
        return;
      }

      await this.paymentService.confirmPayment(req.body);
      ApiResponse.success(res, null, 'Payment confirmed successfully');
    } catch (error: any) {
      console.error('Error confirming payment:', error);
      ApiResponse.error(res, error.message || 'Failed to confirm payment', 500);
    }
  };

  refundPayment = async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        ApiResponse.error(res, 'Validation failed', 400, errors.array());
        return;
      }

      await this.paymentService.processRefund(req.body);
      ApiResponse.success(res, null, 'Refund processed successfully');
    } catch (error: any) {
      console.error('Error processing refund:', error);
      ApiResponse.error(res, error.message || 'Failed to process refund', 500);
    }
  };

  handleWebhook = async (req: Request, res: Response): Promise<void> => {
    try {
      const signature = req.headers['x-razorpay-signature'] as string;

      if (!signature) {
        ApiResponse.error(res, 'Missing Razorpay signature', 400);
        return;
      }

      try {
        // Verify webhook signature
        const shasum = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '');
        shasum.update(JSON.stringify(req.body));
        const digest = shasum.digest('hex');

        if (digest !== signature) {
          console.error('Webhook signature verification failed');
          ApiResponse.error(res, 'Webhook signature verification failed', 400);
          return;
        }
      } catch (err: any) {
        console.error('Webhook signature verification failed:', err.message);
        ApiResponse.error(res, 'Webhook signature verification failed', 400);
        return;
      }

      await this.paymentService.handleWebhookEvent(req.body);
      ApiResponse.success(res, null, 'Webhook processed successfully');
    } catch (error: any) {
      console.error('Error handling webhook:', error);
      ApiResponse.error(res, error.message || 'Failed to handle webhook', 500);
    }
  };
}
