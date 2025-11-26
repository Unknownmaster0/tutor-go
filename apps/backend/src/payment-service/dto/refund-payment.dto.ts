export interface RefundPaymentDto {
  paymentId: string;
  amount?: number; // partial refund if specified
  reason: string;
}
