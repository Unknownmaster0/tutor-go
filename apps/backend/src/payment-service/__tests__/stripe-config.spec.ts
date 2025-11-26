describe('Stripe Configuration', () => {
  const originalEnv = process.env;

  beforeAll(() => {
    // Set required env var for all tests
    process.env.STRIPE_SECRET_KEY = 'sk_test_mock_key';
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should initialize Stripe client successfully', () => {
    const { stripeClient } = require('../config/stripe.config');
    expect(stripeClient).toBeDefined();
    expect(typeof stripeClient.paymentIntents).toBe('object');
  });

  it('should have correct default configuration', () => {
    const { stripeConfig } = require('../config/stripe.config');
    expect(stripeConfig.currency).toBe('usd');
    expect(stripeConfig.paymentMethodTypes).toEqual(['card']);
  });

  it('should load webhook secret from environment', () => {
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_secret';
    jest.resetModules();
    const { STRIPE_WEBHOOK_SECRET } = require('../config/stripe.config');
    expect(STRIPE_WEBHOOK_SECRET).toBe('whsec_test_secret');
  });

  it('should have webhook secret defined', () => {
    const { STRIPE_WEBHOOK_SECRET } = require('../config/stripe.config');
    expect(typeof STRIPE_WEBHOOK_SECRET).toBe('string');
  });
});
