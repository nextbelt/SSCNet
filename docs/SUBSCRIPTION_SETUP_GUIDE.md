# Subscription & Payment Setup Guide

## Overview
A complete subscription system with three tiers (Free, Pro, Premium) integrated with Stripe for payment processing.

## Features Implemented

### 1. Pricing Page (`/pricing`)
- **Free Tier**: $0/month
  - 3 RFQs per month
  - 10 responses per month
  - Basic features
  
- **Pro Tier**: $99/month or $948/year (20% discount)
  - 50 RFQs per month
  - Unlimited responses
  - Advanced analytics
  - Priority support
  - Buyer profile access
  
- **Premium Tier**: $299/month or $2,868/year (20% discount)
  - Unlimited RFQs
  - Unlimited responses
  - All Pro features
  - Dedicated account manager
  - Custom integrations
  - SSO support

### 2. Billing Management Page (`/dashboard/billing`)
- Current subscription display with status badge
- Usage tracking with progress bars (RFQs posted, responses sent)
- Payment method management
- Invoice history with download links
- Upgrade/downgrade options
- Cancellation flow with confirmation modal

### 3. Backend API (`/api/v1/billing`)
- **POST /create-checkout-session**: Create Stripe Checkout for new subscriptions
- **GET /subscription**: Get current user's subscription details
- **GET /invoices**: List all invoices for user
- **POST /cancel-subscription**: Cancel subscription (at end of billing period)
- **POST /webhook**: Handle Stripe webhook events

## Database Schema

### `subscriptions` Table
```sql
- id: UUID (Primary Key)
- user_id: UUID (Foreign Key to users, Unique)
- tier: VARCHAR(50) - 'free', 'pro', 'premium'
- status: VARCHAR(50) - 'active', 'cancelled', 'past_due'
- billing_cycle: VARCHAR(50) - 'monthly', 'annual'
- price_amount: NUMERIC(10,2)
- currency: VARCHAR(10) - Default 'USD'
- stripe_customer_id: VARCHAR(255) (Unique)
- stripe_subscription_id: VARCHAR(255) (Unique)
- stripe_payment_method_id: VARCHAR(255)
- current_period_start: TIMESTAMP
- current_period_end: TIMESTAMP
- trial_start: TIMESTAMP
- trial_end: TIMESTAMP
- cancelled_at: TIMESTAMP
- rfq_limit: INTEGER (null = unlimited)
- rfqs_posted_this_month: INTEGER (Default 0)
- response_limit: INTEGER (null = unlimited)
- responses_sent_this_month: INTEGER (Default 0)
- features_enabled: TEXT (JSON)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

### `invoices` Table
```sql
- id: UUID (Primary Key)
- subscription_id: UUID (Foreign Key to subscriptions)
- invoice_number: VARCHAR(100) (Unique)
- amount: NUMERIC(10,2)
- currency: VARCHAR(10)
- status: VARCHAR(50) - 'pending', 'paid', 'failed', 'refunded'
- stripe_invoice_id: VARCHAR(255) (Unique)
- stripe_payment_intent_id: VARCHAR(255)
- period_start: TIMESTAMP
- period_end: TIMESTAMP
- paid_at: TIMESTAMP
- payment_method: VARCHAR(100)
- invoice_pdf_url: TEXT
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

## Stripe Setup Instructions

### Step 1: Create Stripe Account
1. Go to https://stripe.com and sign up
2. Complete account verification
3. Get your API keys from the Stripe Dashboard

### Step 2: Create Products & Prices in Stripe
1. **Create Products**:
   - Navigate to Products → Add Product
   - Create "Pro Plan" and "Premium Plan"
   
2. **Create Prices**:
   For Pro Plan:
   - Monthly: $99.00 USD recurring monthly
   - Annual: $948.00 USD recurring annually
   
   For Premium Plan:
   - Monthly: $299.00 USD recurring monthly
   - Annual: $2,868.00 USD recurring annually

3. **Copy Price IDs**:
   - Each price will have an ID like `price_1234567890`
   - Update these in `backend/app/api/billing.py`:
   ```python
   PRICING = {
       "pro": {
           "stripe_price_id_monthly": "price_XXXXX",  # Replace with actual ID
           "stripe_price_id_annual": "price_XXXXX"
       },
       "premium": {
           "stripe_price_id_monthly": "price_XXXXX",
           "stripe_price_id_annual": "price_XXXXX"
       }
   }
   ```

### Step 3: Configure Environment Variables
Add to your `.env` file:
```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_... # Your Stripe secret key (test mode)
STRIPE_PUBLISHABLE_KEY=pk_test_... # Your Stripe publishable key (test mode)
STRIPE_WEBHOOK_SECRET=whsec_... # Webhook signing secret (see Step 4)

# Frontend URL for redirect
FRONTEND_URL=http://localhost:3001
```

### Step 4: Set Up Stripe Webhooks
1. In Stripe Dashboard, go to Developers → Webhooks
2. Click "Add endpoint"
3. Endpoint URL: `https://your-domain.com/api/v1/billing/webhook`
4. Select events to listen for:
   - `checkout.session.completed`
   - `invoice.paid`
   - `invoice.payment_failed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Copy the webhook signing secret and add to `.env` as `STRIPE_WEBHOOK_SECRET`

### Step 5: Update Webhook Handler
In `backend/app/api/billing.py`, update the webhook endpoint to verify signatures:
```python
@router.post("/webhook")
async def stripe_webhook(request: Request, db: Session = Depends(get_db)):
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")
    
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, os.getenv("STRIPE_WEBHOOK_SECRET")
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError as e:
        raise HTTPException(status_code=400, detail="Invalid signature")
    
    # Handle the event
    if event["type"] == "checkout.session.completed":
        # ... existing code
```

## Testing

### Test with Stripe Test Cards
Use these test card numbers in Stripe Checkout:
- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **Requires Authentication**: `4000 0025 0000 3155`
- Use any future expiry date and any CVC

### Test Flow
1. Navigate to `/pricing`
2. Click "Start Pro Trial" or upgrade button
3. Complete Stripe Checkout with test card
4. Verify redirect to `/dashboard/billing?success=true`
5. Check subscription is created in database
6. Verify invoice is generated

### Webhook Testing (Local Development)
1. Install Stripe CLI: https://stripe.com/docs/stripe-cli
2. Login: `stripe login`
3. Forward webhooks to local server:
   ```bash
   stripe listen --forward-to localhost:8001/api/v1/billing/webhook
   ```
4. Copy the webhook signing secret from CLI output
5. Trigger test events:
   ```bash
   stripe trigger checkout.session.completed
   ```

## Usage Enforcement

### Track Usage in RFQ/Response Creation
When creating RFQs or responses, check limits:

```python
from app.models.user import Subscription

# In RFQ creation endpoint
subscription = db.query(Subscription).filter(Subscription.user_id == current_user.id).first()

if subscription.rfq_limit is not None:
    if subscription.rfqs_posted_this_month >= subscription.rfq_limit:
        raise HTTPException(
            status_code=403,
            detail=f"Monthly RFQ limit reached. Upgrade to post more RFQs."
        )

# Increment counter
subscription.rfqs_posted_this_month += 1
db.commit()
```

### Reset Monthly Counters
Create a cron job to reset counters on 1st of each month:
```python
# Monthly reset script
from sqlalchemy.orm import Session
from app.models.user import Subscription

def reset_monthly_usage(db: Session):
    db.query(Subscription).update({
        "rfqs_posted_this_month": 0,
        "responses_sent_this_month": 0
    })
    db.commit()
```

## UI Integration

### Access Links
- Main pricing page: `/pricing`
- Billing management: `/dashboard/billing`
- Account menu includes "Billing" link with CreditCard icon

### Frontend API Calls
Example: Check subscription status
```typescript
const response = await fetch('http://localhost:8001/api/v1/billing/subscription', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
  }
});
const subscription = await response.json();
```

## Production Checklist
- [ ] Switch from Stripe test keys to live keys
- [ ] Update webhook URL to production domain
- [ ] Enable Stripe Radar for fraud detection
- [ ] Set up email receipts in Stripe Dashboard
- [ ] Configure tax collection if required
- [ ] Set up billing alerts and monitoring
- [ ] Implement proper error handling for failed payments
- [ ] Add retry logic for failed webhooks
- [ ] Set up customer portal for self-service (optional)

## Security Considerations
1. **Never expose Stripe secret key** in frontend
2. **Always verify webhook signatures** before processing
3. **Use HTTPS in production** for all payment-related endpoints
4. **Log all payment events** for audit trail
5. **Implement idempotency** for webhook processing
6. **Rate limit payment endpoints** to prevent abuse

## Support & Documentation
- Stripe Documentation: https://stripe.com/docs
- Stripe API Reference: https://stripe.com/docs/api
- Stripe Testing: https://stripe.com/docs/testing
- Webhook Events: https://stripe.com/docs/api/events

## Next Steps
1. Set up Stripe account and get API keys
2. Create products and prices in Stripe Dashboard
3. Update price IDs in billing.py
4. Add environment variables
5. Test checkout flow with test cards
6. Set up webhooks for production
7. Implement usage enforcement in RFQ/response endpoints
8. Create monthly reset job for usage counters
