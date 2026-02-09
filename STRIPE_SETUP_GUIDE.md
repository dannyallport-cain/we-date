# Stripe Integration Setup & Testing Guide

**Last Updated**: February 2026  
**Status**: ✅ Ready for testing

---

## 📋 Overview

WeDate has full Stripe integration for premium subscriptions with:
- ✅ Checkout session creation
- ✅ Payment processing
- ✅ Webhook handling
- ✅ Premium feature enforcement
- ✅ Subscription status tracking

---

## 🔧 Setup Instructions

### Step 1: Create a Stripe Account

1. Go to [stripe.com](https://stripe.com)
2. Sign up and verify your email
3. Complete your account information
4. Accept the Stripe Service Agreement

### Step 2: Get Your API Keys

1. Log in to [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to **Developers** > **API Keys** (top right)
3. Copy your keys:
   - **Secret Key** - starts with `sk_test_` (test mode) or `sk_live_` (production)
   - **Publishable Key** - starts with `pk_test_` or `pk_live_`
4. Add these to your `.env` file:

```dotenv
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
```

### Step 3: Create Products & Prices

#### Option A: Via Stripe Dashboard (Recommended)

1. Navigate to **Products** in the left sidebar
2. Click **+ Add Product**
3. Create these three products:

**Product 1: Premium Monthly**
- Name: `Premium - Monthly`
- Description: `WeDate Premium - 1 Month Access`
- Price: `$9.99` / month
- Billing cycle: Monthly
- Copy the **Price ID** (format: `price_xxxxxxxxxxxxx`)

**Product 2: Premium 3-Month**
- Name: `Premium - 3 Months`
- Description: `WeDate Premium - 3 Months Access`
- Price: `$24.99` / 3 months
- Billing cycle: Custom (90 days)
- Copy the **Price ID**

**Product 3: Premium Yearly**
- Name: `Premium - Yearly`
- Description: `WeDate Premium - 12 Months Access`
- Price: `$59.99` / year
- Billing cycle: Annual
- Copy the **Price ID**

#### Option B: Via Stripe CLI (Advanced)

Use the Stripe CLI to create products programmatically:

```bash
# Create products
stripe products create --name "Premium - Monthly" --type service
stripe products create --name "Premium - 3 Months" --type service
stripe products create --name "Premium - Yearly" --type service

# Create prices (replace product_ids)
stripe prices create --product=prod_xxxxx --unit-amount=999 --currency=usd --recurring='{"interval":"month"}'
stripe prices create --product=prod_xxxxx --unit-amount=2499 --currency=usd --recurring='{"interval":"month","interval_count":3}'
stripe prices create --product=prod_xxxxx --unit-amount=5999 --currency=usd --recurring='{"interval":"year"}'
```

### Step 4: Add Price IDs to Environment

Add the price IDs to your `.env` file:

```dotenv
STRIPE_PRICE_MONTHLY=price_xxxxxxxxxxxxx
STRIPE_PRICE_3MONTHS=price_xxxxxxxxxxxxx
STRIPE_PRICE_YEARLY=price_xxxxxxxxxxxxx
```

### Step 5: Setup Webhooks

1. Go to **Developers** > **Webhooks**
2. Click **+ Add Endpoint**
3. Enter endpoint URL:
   - **Testing**: `http://localhost:3000/api/webhooks/stripe`
   - **Production**: `https://yourdomain.com/api/webhooks/stripe`
4. Select **Events to Send**:
   - `checkout.session.completed`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `customer.subscription.deleted`
5. Click **Add Endpoint**
6. Click into the webhook, scroll down to **Signing secret**
7. Copy and add to `.env`:

```dotenv
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

---

## 🧪 Testing

### Test Cards

Use these Stripe test card numbers (test mode only):

| Card Number | Expiry | CVC | Use Case |
|---|---|---|---|
| 4242 4242 4242 4242 | Any future date | Any 3 digits | Successful payment |
| 4000 0000 0000 0002 | Any future date | Any 3 digits | Card declined |
| 5555 5555 5555 4444 | Any future date | Any 3 digits | Mastercard test |
| 3782 822463 10005 | Any future date | Any 3 digits | American Express |

### Testing Flow

#### 1. Test Subscription Creation

1. Start your dev server: `npm run dev`
2. Navigate to [http://localhost:3000/premium](http://localhost:3000/premium)
3. Click **Get Monthly**, **Get 3 Months**, or **Get Yearly**
4. Use test card `4242 4242 4242 4242`
5. Fill in any email, future expiry date, and any 3-digit CVC
6. Click **Subscribe**
7. You should be redirected to `/settings?success=true`

#### 2. Check Database

Verify the subscription was recorded:

```bash
psql $DATABASE_URL

# Check user premium status
SELECT id, displayName, isPremium, premiumUntil FROM "User" WHERE isPremium = true;
```

#### 3. Test Premium Features

Premium features will now be unlocked:

- ✅ **Unlimited Likes** - No 20-like limit in swipe API
- ✅ **See Who Liked You** - Access `/api/profile/liked-me`
- ✅ **Rewind Swipes** - Undo button no longer shows paywall on `/swipe`
- ✅ **Profile Boost** - Access `/api/boost` endpoint

#### 4. Test Webhook Locally (Optional)

Use the Stripe CLI to forward webhooks:

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to localhost
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Listen for events in another terminal
stripe trigger checkout.session.completed
stripe trigger invoice.payment_succeeded
```

---

## 🔀 Webhook Events

The app handles these webhook events:

### `checkout.session.completed`
**Triggered**: When user completes payment  
**Action**: Mark user as premium, set `premiumUntil` to current period end

**Code**: [lib/subscription.ts#L12](lib/subscription.ts#L12)

```typescript
export async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId
  // ... retrieves subscription and sets isPremium = true
}
```

### `invoice.payment_succeeded`
**Triggered**: When automatic renewal invoice is paid  
**Action**: Extend `premiumUntil` to new period end

**Code**: [lib/subscription.ts#L49](lib/subscription.ts#L49)

```typescript
export async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  // ... extends premium until next period
}
```

### `invoice.payment_failed`
**Triggered**: When automatic renewal payment fails  
**Action**: Log the failure (email should be sent by Stripe)

**Code**: [lib/subscription.ts#L83](lib/subscription.ts#L83)

### `customer.subscription.deleted`
**Triggered**: When user cancels subscription  
**Action**: Set `isPremium = false`

**Code**: [lib/subscription.ts#L102](lib/subscription.ts#L102)

---

## 🔐 Security Checklist

- ✅ **Secret Key in Environment**: Never expose `STRIPE_SECRET_KEY`
- ✅ **Webhook Signature Verification**: All webhooks verified before processing
- ✅ **Token-based Auth**: All endpoints require JWT token
- ✅ **User Validation**: Webhook metadata verified against database
- ✅ **HTTPS Required**: Webhooks only accepted over HTTPS (in production)

---

## 🚀 Production Deployment

### Before Going Live

1. **Switch to Live Keys**
   - Get live keys from Stripe Dashboard
   - Update `.env` with `sk_live_` and `pk_live_` keys
   - Update webhook secret with live signing secret

2. **Update Webhook URL**
   - Change webhook endpoint to production domain
   - Update in Stripe Dashboard > Webhooks

3. **Set Correct URLs**
   - Update `NEXT_PUBLIC_APP_URL` to your production domain
   - Subscription redirect URLs will use this

4. **Test Live Payment**
   - Process a real payment with your own card
   - Verify user gets premium access
   - Check database for correct `premiumUntil` date

5. **Monitor Webhooks**
   - Subscribe to email alerts for failed webhooks
   - Check webhook logs daily in Stripe Dashboard

### Stripe Dashboard Monitoring

- **Customers**: See all customers and their subscription status
- **Invoices**: View all charges and refunds
- **Webhooks**: Monitor webhook deliveries and retries
- **Disputes**: Handle chargebacks and disputes

---

## 🐛 Troubleshooting

### "Stripe not configured" Error

**Issue**: `{ error: 'Stripe not configured' }`

**Solution**: Verify environment variables are set:
```bash
echo $STRIPE_SECRET_KEY
echo $STRIPE_PUBLISHABLE_KEY
```

### Webhook Signature Verification Failed

**Issue**: `Webhook signature verification failed`

**Causes**:
1. Wrong webhook secret (copy again from Stripe)
2. Webhook payload modified
3. Time skew (check server time)

**Solution**:
```bash
# Verify time sync
date
# Rebuild and restart
npm run dev
```

### User Not Marked as Premium

**Issue**: Payment succeeded but `isPremium` stays false

**Causes**:
1. Webhook not received (check Stripe Dashboard > Webhooks)
2. User ID mismatch in metadata
3. Database error

**Solution**:
```bash
# Check webhook deliveries
# In Stripe Dashboard > Developers > Webhooks > [webhook]
# Look for "checkout.session.completed" event

# Manually trigger webhook for testing
stripe trigger checkout.session.completed
```

### Customers Not Found for Portal

**Issue**: `Stripe customer not found` when accessing subscription portal

**Cause**: User created checkout session but Stripe created new customer

**Solution**: 
- Ensure `customer_email` is set in checkout session
- Or create customer explicitly before checkout

---

## 📊 Useful Queries

### Check All Premium Users
```sql
SELECT id, displayName, email, isPremium, premiumUntil 
FROM "User" 
WHERE isPremium = true 
ORDER BY premiumUntil DESC;
```

### Check Expired Premiums
```sql
SELECT id, displayName, email, premiumUntil 
FROM "User" 
WHERE isPremium = true 
AND premiumUntil < NOW();
```

### Count Active Subscriptions
```sql
SELECT COUNT(*) as active_premiums 
FROM "User" 
WHERE isPremium = true 
AND premiumUntil > NOW();
```

---

## 📚 Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Testing Guide](https://stripe.com/docs/testing)
- [Stripe CLI Reference](https://stripe.com/docs/stripe-cli)
- [Webhook Events](https://stripe.com/docs/api/events/types)

---

## 🎯 Next Steps

1. ✅ Create Stripe account and API keys
2. ✅ Create products/prices
3. ✅ Setup webhook endpoint
4. ✅ Test subscription flow with test cards
5. Add email notifications for subscription events (optional)
6. Add invoice/receipt emails (optional)
7. Add subscription management UI improvements (optional)
8. Switch to live keys and go live!

---

**Questions?** Refer to the code files:
- [lib/stripe.ts](lib/stripe.ts) - Configuration
- [lib/subscription.ts](lib/subscription.ts) - Event handlers
- [app/api/subscription/create/route.ts](app/api/subscription/create/route.ts) - Checkout creation
- [app/api/webhooks/stripe/route.ts](app/api/webhooks/stripe/route.ts) - Webhook handler
