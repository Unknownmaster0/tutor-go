# Razorpay Payment Integration Setup

## Environment Variables Required

### Backend (.env)
```env
# Razorpay Configuration
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id
```

## Installation Steps

### 1. Install Dependencies
```bash
# Backend
cd apps/backend
npm install razorpay @types/razorpay

# Frontend
cd apps/frontend
npm install
```

### 2. Verify Configuration
- Razorpay config: `apps/backend/src/payment-service/config/razorpay.config.ts`
- Payment service: `apps/backend/src/payment-service/services/payment.service.ts`
- Payment controller: `apps/backend/src/payment-service/controllers/payment.controller.ts`
- Payment routes: `apps/backend/src/payment-service/routes/payment.routes.ts`

### 3. Frontend Pages Created
- Payment page: `apps/frontend/src/app/booking/[id]/payment/page.tsx`
  - Displays booking summary
  - Initiates Razorpay checkout
  - Verifies payment signature
  - Updates booking status on success

## API Endpoints

### POST /payments/create-order
Creates a Razorpay order for the booking.

**Request:**
```json
{
  "bookingId": "uuid",
  "amount": 500.00,
  "currency": "INR"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "orderId": "order_xxx",
    "amount": 500.00,
    "currency": "INR"
  }
}
```

### POST /payments/confirm
Confirms the payment after successful Razorpay transaction.

**Request:**
```json
{
  "orderId": "order_xxx",
  "paymentId": "pay_xxx",
  "signature": "signature_xxx",
  "bookingId": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment confirmed successfully"
}
```

### POST /payments/refund
Processes a refund for a completed booking.

**Request:**
```json
{
  "paymentId": "uuid",
  "amount": 500.00,
  "reason": "Customer requested cancellation"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Refund processed successfully"
}
```

## Payment Flow

1. **User selects booking slot** → Booking created with status `pending`
2. **User proceeds to payment** → Redirected to `/booking/[id]/payment`
3. **Payment page loads** → Fetches booking details and creates Razorpay order
4. **User completes payment** → Razorpay checkout dialog appears
5. **Payment successful** → Frontend sends confirmation to backend
6. **Backend verifies** → Signature verification + API call to Razorpay
7. **Booking confirmed** → Booking status changes to `confirmed`
8. **Redirect to success** → User sees confirmation page

## Webhook Configuration

To handle Razorpay webhooks for async payment confirmations:

1. Go to Razorpay Dashboard → Settings → Webhooks
2. Add webhook URL: `https://your-domain.com/api/payments/webhook`
3. Select events:
   - payment.authorized
   - payment.captured
   - payment.failed
4. Add alert email and keep active

The webhook endpoint (`POST /payments/webhook`) handles:
- `payment.authorized` - Logs authorization
- `payment.captured` - Confirms payment (payment.captured event)
- `payment.failed` - Marks payment as failed, keeps booking in pending status

## Testing

### Test Razorpay Integration Locally
1. Get test credentials from [Razorpay Dashboard](https://dashboard.razorpay.com)
2. Use test card: 4111111111111111 (Visa)
3. Expiry: Any future date
4. CVV: 123

### Complete Payment Flow Test
```bash
# 1. Start backend services
npm run dev

# 2. Start frontend
npm run dev

# 3. In browser:
# - Navigate to tutor profile
# - Click "Book Now"
# - Select date/time slot
# - Submit booking
# - Click "Proceed to Payment"
# - Complete Razorpay payment with test card
# - Verify booking status changes to "confirmed"
```

## Key Changes Made

### Backend Files
- Created: `config/razorpay.config.ts` - Razorpay client initialization
- Updated: `services/payment.service.ts` - Razorpay payment flow
- Updated: `controllers/payment.controller.ts` - Razorpay webhook handling
- Updated: `routes/payment.routes.ts` - Added `/create-order` endpoint
- Updated: `validators/payment.validator.ts` - Razorpay field validation

### Frontend Files
- Created: `app/booking/[id]/payment/page.tsx` - Payment page component
- Updated: `app/booking/new/page.tsx` - Fixed redirect to payment page

### Package Updates
- Backend: Added `razorpay` and `@types/razorpay`
- Frontend: Razorpay script loaded via CDN (no new package needed)

## Signature Verification

Razorpay uses HMAC-SHA256 for signature verification:

```typescript
const body = `${orderId}|${paymentId}`;
const expectedSignature = crypto
  .createHmac('sha256', RAZORPAY_KEY_SECRET)
  .update(body)
  .digest('hex');

const isValid = expectedSignature === providedSignature;
```

This ensures payment confirmations come from Razorpay and not forged.

## Security Notes

1. **Never expose** `RAZORPAY_KEY_SECRET` in frontend code
2. **Always verify** payment signatures on backend
3. **Use HTTPS** for production webhook endpoints
4. **Validate amount** matches booking amount before confirming
5. **Handle race conditions** - Check booking status before updating

## Troubleshooting

### Payment page shows 404
- Ensure booking exists in database with correct UUID
- Check API client is correctly configured
- Verify booking service is running on correct port

### Razorpay checkout not loading
- Check `NEXT_PUBLIC_RAZORPAY_KEY_ID` is set in frontend
- Verify Razorpay script loads from CDN
- Check browser console for errors

### Signature verification fails
- Ensure `RAZORPAY_KEY_SECRET` matches in backend
- Verify order ID and payment ID are correct
- Check signature hasn't been tampered with

### Booking not confirmed after payment
- Check backend payment service is running
- Verify RabbitMQ is publishing event successfully
- Check database transaction completed

## References

- [Razorpay Node.js SDK](https://github.com/razorpay/razorpay-node)
- [Razorpay Checkout Documentation](https://razorpay.com/docs/payment-gateway/web-integration/hosted-checkout/)
- [Razorpay Webhook Documentation](https://razorpay.com/docs/webhooks/)
