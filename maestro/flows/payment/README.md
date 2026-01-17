# Tax Payment Test Flow

This test validates the tax payment functionality in the SmartCity Mobile application.

## Test Overview

The test performs the following steps:

1. **Reset Arrears Status** - Calls the backend API to reset arrears recovery status to "pending"
2. **Logout** - Ensures clean state by logging out any existing session
3. **Login** - Signs in as user `amal` with password `123`
4. **Select Council** - Chooses "Mahara" council
5. **Navigate to Tax** - Goes to the Tax section
6. **Navigate to Payment Tab** - Switches to the Payment tab
7. **Select Parcel** - Checks the LP002-U01 checkbox

## Prerequisites

### Backend Setup

The backend must have the reset arrears endpoint exposed:

```csharp
[HttpPost("reset-arrears-status")]
public async Task<IActionResult> ResetArrearsRecoveryStatus([FromBody] ResetArrearsStatusDto dto)
```

### Test Data Requirements

1. User credentials:
   - Username: `amal`
   - Password: `123`

2. Council: `Mahara`

3. Land Parcel: `LP002-U01` with arrears data

### Configuration

Before running the test, update the arrears IDs in `maestro/scripts/initTaxPaymentTest.js`:

```javascript
// Replace with actual arrears IDs for LP002-U01
const arrearsIds = [1, 2, 3];
```

To find the correct arrears IDs, query your database:

```sql
SELECT ArrearsID FROM Arrears
WHERE LandParcelID = (SELECT LandParcelID FROM LandParcels WHERE ParcelNumber = 'LP002-U01');
```

## Running the Test

### Single Test

```bash
maestro test maestro/flows/payment/tax-payment.yaml
```

### With Cloud Upload

```bash
maestro test maestro/flows/payment/tax-payment.yaml --format junit --output maestro-results.xml
maestro cloud maestro/flows/payment/tax-payment.yaml
```

## Test Flow Details

### 1. Initialization Script

`maestro/scripts/initTaxPaymentTest.js`

- Generates unique test ID
- Calls reset-arrears-status endpoint
- Logs success/failure of reset operation

### 2. Authentication

- Navigates to Keycloak login
- Enters credentials
- Waits for successful authentication

### 3. Council Selection

- Selects Mahara from dropdown
- Continues to home screen

### 4. Tax Payment Navigation

- Taps "Tax" navigation item
- Switches to "Payment" tab
- Locates LP002-U01 parcel
- Taps checkbox to select

## Screenshots

The test captures screenshots at key points:

- `tax_payment_auth_screen.png` - Initial auth screen
- `tax_payment_keycloak_login.png` - After login submission
- `tax_payment_council_selection.png` - Council selection screen
- `tax_payment_home_screen.png` - Home screen after login
- `tax_payment_tax_screen.png` - Tax section
- `tax_payment_payment_tab.png` - Payment tab
- `tax_payment_selected_checkbox.png` - After selecting checkbox
- `tax_payment_final_state.png` - Final state

## Expected Behavior

1. **Reset Operation**: Should successfully reset arrears status to "pending"
2. **Login**: Should authenticate successfully with Keycloak
3. **Council Selection**: Should display Mahara and allow selection
4. **Tax Section**: Should show tax information for the user
5. **Payment Tab**: Should display land parcels with arrears
6. **Checkbox Selection**: Should allow selection of LP002-U01

## Troubleshooting

### Reset Fails

- Verify backend API is accessible
- Check arrears IDs are correct
- Ensure database connection is working

### Login Fails

- Verify Keycloak is running
- Check user credentials
- Ensure OAuth configuration is correct

### LP002-U01 Not Found

- Verify land parcel exists in database
- Check that parcel is associated with user `amal`
- Ensure arrears data exists for the parcel

### Tab Not Visible

- Check UI implementation
- Verify tab labels match exactly
- Increase timeout if needed

## Next Steps

After this test, you may want to add:

- [ ] Complete payment flow
- [ ] Payment confirmation
- [ ] Receipt generation
- [ ] Payment history verification
- [ ] Negative test cases (insufficient funds, network errors)

## API Integration

The reset function is also available in the app via:

```typescript
import { resetArrearsRecoveryStatus } from "@/api/taxAction";

// Usage
const result = await resetArrearsRecoveryStatus([1, 2, 3]);
```
