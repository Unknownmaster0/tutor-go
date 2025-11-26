/**
 * Event type definitions for RabbitMQ messages
 */

export interface BookingCreatedEvent {
  bookingId: string;
  tutorId: string;
  studentId: string;
  subject: string;
  startTime: Date;
  totalAmount: number;
  timestamp: Date;
}

export interface BookingCancelledEvent {
  bookingId: string;
  tutorId: string;
  studentId: string;
  totalAmount: number;
  cancellationReason?: string;
  timestamp: Date;
}

export interface PaymentCompletedEvent {
  paymentId: string;
  bookingId: string;
  amount: number;
  studentId: string;
  tutorId: string;
  timestamp: Date;
}

export interface ReviewSubmittedEvent {
  reviewId: string;
  tutorId: string;
  studentId: string;
  bookingId: string;
  rating: number;
  comment?: string;
  timestamp: Date;
}

export type EventType =
  | BookingCreatedEvent
  | BookingCancelledEvent
  | PaymentCompletedEvent
  | ReviewSubmittedEvent;

export enum RoutingKey {
  BOOKING_CREATED = 'booking.created',
  BOOKING_CANCELLED = 'booking.cancelled',
  PAYMENT_COMPLETED = 'payment.completed',
  REVIEW_SUBMITTED = 'review.submitted',
}

export enum QueueName {
  NOTIFICATION_BOOKING = 'notification.booking',
  NOTIFICATION_PAYMENT = 'notification.payment',
  NOTIFICATION_REVIEW = 'notification.review',
  PAYMENT_REFUND = 'payment.refund',
}

export interface RabbitMQConfig {
  url: string;
  exchangeName: string;
  exchangeType: 'topic' | 'direct' | 'fanout';
  retryAttempts: number;
  retryDelay: number;
}
