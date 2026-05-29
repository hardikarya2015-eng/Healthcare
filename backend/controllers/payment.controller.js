const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { successResponse, errorResponse } = require('../utils/response');

/**
 * POST /api/payments/create-intent
 * Creates a Stripe PaymentIntent for the given amount (in INR).
 * Returns the client_secret to the frontend for card confirmation.
 */
const createPaymentIntent = async (req, res) => {
  const { amount } = req.body; // amount in ₹ (e.g. 549.00)

  if (!amount || amount <= 0)
    return errorResponse(res, 'Invalid amount', 400);

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe expects paise (₹1 = 100 paise)
      currency: 'inr',
      metadata: { user_id: req.user.id },
      automatic_payment_methods: { enabled: true },
    });

    return successResponse(res, { client_secret: paymentIntent.client_secret });
  } catch (err) {
    console.error('Stripe error:', err.message);
    return errorResponse(res, err.message || 'Payment setup failed', 500);
  }
};

module.exports = { createPaymentIntent };
