# Stripe Payment Sheet Troubleshooting

## Error: "Failed to retrieve a PaymentSheetResult"

This error occurs when the Stripe Payment Sheet cannot complete the payment flow. Here's what to check:

---

## 1. Backend Payment Intent Creation

Your backend must create the PaymentIntent with these **required** parameters:

```csharp
var options = new PaymentIntentCreateOptions
{
    Amount = request.Amount, // Amount in cents
    Currency = "lkr",

    // ⚠️ CRITICAL: Must specify automatic payment methods
    AutomaticPaymentMethods = new PaymentIntentAutomaticPaymentMethodsOptions
    {
        Enabled = true,
    },

    // Optional but recommended
    Description = request.Description,
    Metadata = new Dictionary<string, string>
    {
        { "residentId", request.ResidentId },
        { "councilId", councilId },
    },
};

var paymentIntent = await paymentIntentService.CreateAsync(options);
```

---

## 2. Stripe Dashboard Configuration

### Enable Payment Methods:

1. Go to: https://dashboard.stripe.com/settings/payment_methods
2. Enable at least **Card payments**
3. For LKR currency, verify it's supported in your region

### Check Automatic Payment Methods:

1. Go to: https://dashboard.stripe.com/settings/payment_methods
2. Ensure "Automatically enable new payment methods" is turned ON

### Verify Account Activation:

1. Go to: https://dashboard.stripe.com/settings/account
2. Complete all required steps to activate your account
3. For test mode, ensure you're using test API keys

---

## 3. Currency Support (LKR)

### Important Notes for Sri Lankan Rupee:

- **Minimum charge**: 100 LKR (10,000 cents)
- **Maximum charge**: 999,999 LKR
- **Supported payment methods**: Card payments only
- **Not supported**: Some payment methods like Apple Pay, Google Pay may not work with LKR

### Verify Currency in Code:

```typescript
// Frontend - ensure amount is in cents
convertToCents(total); // Must return >= 10000 for LKR

// Backend - verify currency is lowercase
Currency = "lkr"; // ✓ Correct
Currency = "LKR"; // ✗ Wrong
```

---

## 4. Mobile App Configuration

### Check Expo Environment Variables:

```bash
# .env file or app.json
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx  # Must start with pk_test_ or pk_live_
```

### Verify StripeProvider:

```tsx
<StripeProvider
  publishableKey={process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY}
  merchantIdentifier="merchant.com.smartcity" // Optional - only needed for Apple Pay
>
```

---

## 5. Backend Response Format

Ensure your backend returns:

```json
{
  "clientSecret": "pi_xxx_secret_xxx",
  "paymentIntentId": "pi_xxx"
}
```

**NOT wrapped in ApiResponse** unless the frontend can handle it.

---

## 6. Testing Checklist

- [ ] Backend creates PaymentIntent with `AutomaticPaymentMethods.Enabled = true`
- [ ] Card payments enabled in Stripe Dashboard
- [ ] Using correct Stripe API keys (test vs live)
- [ ] Amount is >= 10,000 cents (100 LKR)
- [ ] Currency is lowercase "lkr"
- [ ] Stripe account is activated
- [ ] EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY is set correctly
- [ ] Backend returns clientSecret in correct format

---

## 7. Common Backend Issues

### Missing AutomaticPaymentMethods:

```csharp
// ✗ WRONG - This will cause PaymentSheetResult error
var options = new PaymentIntentCreateOptions
{
    Amount = 10000,
    Currency = "lkr",
    // Missing AutomaticPaymentMethods!
};

// ✓ CORRECT
var options = new PaymentIntentCreateOptions
{
    Amount = 10000,
    Currency = "lkr",
    AutomaticPaymentMethods = new PaymentIntentAutomaticPaymentMethodsOptions
    {
        Enabled = true,
    },
};
```

### Wrong Currency Format:

```csharp
Currency = "LKR", // ✗ Wrong - must be lowercase
Currency = "lkr", // ✓ Correct
```

---

## 8. Debug Commands

### Check Stripe Keys:

```bash
# In your terminal
echo $EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY
```

### View Payment Intent in Stripe Dashboard:

1. Copy the `paymentIntentId` from logs (e.g., `pi_3TD6SHJ1oAs7f97x1Yn5M9yv`)
2. Go to: https://dashboard.stripe.com/test/payments
3. Search for the payment intent ID
4. Check the "Payment method types" field - it should show "card" or similar

---

## 9. Alternative: Use Card Element Directly

If PaymentSheet continues to fail, consider using the CardField component:

```tsx
import { CardField, useConfirmPayment } from "@stripe/stripe-react-native";

// In your component
const { confirmPayment } = useConfirmPayment();

<CardField
  postalCodeEnabled={false}
  onCardChange={(cardDetails) => {
    console.log("Card details:", cardDetails);
  }}
  style={{ height: 50 }}
/>;

// On payment button press
const { error, paymentIntent } = await confirmPayment(clientSecret, {
  paymentMethodType: "Card",
});
```

---

## Most Likely Fix

**Add this to your backend PaymentIntent creation:**

```csharp
AutomaticPaymentMethods = new PaymentIntentAutomaticPaymentMethodsOptions
{
    Enabled = true,
},
```

This is the #1 cause of "Failed to retrieve a PaymentSheetResult" errors.
