export interface PaymentIntent {
  clientSecret: string;
  paymentIntentId: string;
}

export interface PaymentConfirmation {
  success: boolean;
  bookingId: string;
  paymentId: string;
  message: string;
}

export interface PaymentError {
  message: string;
  code?: string;
}
