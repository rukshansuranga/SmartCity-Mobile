# Council Selection & Token Management Refactor

## 🎯 Overview

This refactor implements mandatory council selection during registration/login, automatic token refresh, and council-based data filtering for the SmartCity Mobile app.

## ✅ Completed Changes

### 1. **Types Updated** (`types/index.ts`)

- Added `Council` type with `value` and `label` fields
- Added `TokenPayload` type for Keycloak token responses

### 2. **Auth Store Enhanced** (`stores/authStore.ts`)

- **New State:**
  - `refreshToken`: Stores OAuth refresh token
  - `tokenExpiresAt`: Timestamp for token expiration
  - `councils`: Array of available councils from Keycloak
  - `selectedCouncil`: Currently selected council
- **New Methods:**
  - `setCouncils(councils)`: Store available councils
  - `setSelectedCouncil(council)`: Set user's selected council
  - `updateTokens(token)`: Update access & refresh tokens
  - `isTokenExpired()`: Check if token needs refresh (with 5-min buffer)

### 3. **Token Manager** (`lib/tokenManager.ts`)

- **`refreshAccessToken()`**: Exchanges refresh token for new access token
- **`validateAndRefreshToken()`**: Validates token and refreshes if expired
- **`getValidAccessToken()`**: Returns valid token or refreshes automatically

### 4. **Fetch Wrapper Updated** (`lib/fetchWrapper.ts`)

- **Auto Token Refresh**: Validates token before every API call
- **Council Header**: Adds `X-Council-Id` header to all requests
- Backend receives council ID for database switching

### 5. **Sign In Flow** (`app/signIn.tsx`)

- Extracts councils from Keycloak `userInfo.councils`
- Stores `refresh_token` and `expires_in`
- Navigates to `selectCouncil` if no council selected
- Navigates to `home` if council already selected

### 6. **Council Selection Screen** (`app/selectCouncil.tsx`)

- Dropdown picker showing available councils
- Mandatory selection before accessing app
- Saves selection to auth store
- Clean, user-friendly UI

### 7. **App Layout Enhanced** (`app/_layout.tsx`)

- **Token Validation on App Load:**
  - Checks if token is expired
  - Auto-refreshes token if needed
  - Logs out if refresh fails
- **Council Check:**
  - Redirects to `selectCouncil` if not selected
  - Blocks app access until council chosen

### 8. **Council Switcher Component** (`components/CouncilSwitcher.tsx`)

- Modal for switching councils
- Shows current council
- Can be used from profile/settings

---

## 🔄 User Flows

### **New User Registration**

```
1. User clicks "Sign Up"
2. Keycloak registration → Returns tokens
3. App registers client in backend
4. App extracts councils from userInfo
5. Navigate to selectCouncil screen
6. User selects council → Navigate to home
```

### **Existing User Login**

```
1. User clicks "Sign In"
2. Keycloak login → Returns tokens
3. App extracts councils from userInfo
4. Check if council already selected:
   - Yes → Navigate to home
   - No → Navigate to selectCouncil
```

### **App Restart with Valid Token**

```
1. App loads → Hydrate auth store
2. Check token expiry → Still valid
3. Check council selection → Valid
4. Navigate to home
```

### **App Restart with Expired Token**

```
1. App loads → Hydrate auth store
2. Check token expiry → Expired
3. Attempt token refresh → Success
4. Check council selection → Valid
5. Navigate to home
```

### **Token Refresh Failure**

```
1. Token expires during app use
2. API call triggers token refresh
3. Refresh fails (invalid refresh token)
4. Logout user
5. Navigate to signIn
```

---

## 🔧 Backend Integration

### **Headers Sent to Backend**

Every API request now includes:

```http
Authorization: Bearer <access_token>
X-Council-Id: <selected_council_value>
```

### **Backend Responsibility**

- Read `X-Council-Id` header
- Switch to corresponding database
- Filter all data by council

---

## 📝 Keycloak Configuration Required

### **User Attributes**

Add custom attribute to Keycloak users:

```json
{
  "councils": [
    { "value": "colombo", "label": "Colombo Municipal Council" },
    { "value": "kandy", "label": "Kandy Municipal Council" }
  ]
}
```

### **Token Claims**

Ensure `councils` is included in userInfo endpoint response.

### **Client Configuration**

- Enable refresh tokens
- Set appropriate token expiry (e.g., 5 minutes for access, 30 days for refresh)

---

## 🎨 UI/UX Features

### **Select Council Screen**

- Clean, modern design
- Dropdown with all available councils
- Validation before proceeding
- Error messages for edge cases

### **Council Switcher Modal**

- Shows current council
- Easy switching
- Disabled if same council selected
- Can be triggered from profile/settings

---

## 🔒 Security Features

1. **Automatic Token Refresh**: Happens transparently
2. **5-Minute Buffer**: Refreshes before actual expiry
3. **Secure Storage**: Uses `expo-secure-store`
4. **Logout on Refresh Failure**: Ensures no stale sessions

---

## 🚀 How to Use Council Switcher

Add to any screen (e.g., `home.tsx` or `editUser.tsx`):

```tsx
import CouncilSwitcher from "@/components/CouncilSwitcher";
import { useState } from "react";

export default function YourScreen() {
  const [showCouncilSwitcher, setShowCouncilSwitcher] = useState(false);

  return (
    <View>
      {/* Your content */}

      <Button onPress={() => setShowCouncilSwitcher(true)}>
        Switch Council
      </Button>

      <CouncilSwitcher
        visible={showCouncilSwitcher}
        onDismiss={() => setShowCouncilSwitcher(false)}
      />
    </View>
  );
}
```

---

## 🧪 Testing Checklist

- [ ] New user registration → Council selection required
- [ ] Existing user login with council → Goes to home
- [ ] Existing user login without council → Goes to selectCouncil
- [ ] Token refresh works automatically
- [ ] Token refresh failure logs out user
- [ ] Council ID sent in all API requests
- [ ] Council switching works from modal
- [ ] App restart with valid token → Home
- [ ] App restart with expired token → Refresh → Home
- [ ] App restart with invalid refresh token → SignIn

---

## 📦 Dependencies

No new dependencies needed! Using existing packages:

- `@react-native-picker/picker` (already installed)
- `expo-secure-store` (already in use)
- `zustand` (already in use)

---

## 🐛 Known Issues to Address

1. **Type Safety**: Some `as any` casts for router navigation (Expo Router doesn't recognize new route yet)
   - **Fix**: Add to route types or wait for type regeneration

2. **Council Empty Array**: If user has no councils in Keycloak
   - **Current**: Shows error message
   - **Improvement**: Contact support flow

---

## 📚 Next Steps (Optional Enhancements)

1. **Add to Home Screen**: Show current council name
2. **Add to Header**: Quick council switcher in app bar
3. **Analytics**: Track council switching frequency
4. **Offline Support**: Cache council selection
5. **Council Colors**: Different theme per council

---

## 🔗 Modified Files Summary

```
✅ types/index.ts - Added Council and TokenPayload types
✅ stores/authStore.ts - Enhanced with council and token management
✅ lib/tokenManager.ts - NEW - Token refresh logic
✅ lib/fetchWrapper.ts - Added auto-refresh and council header
✅ app/signIn.tsx - Extract councils and handle navigation
✅ app/selectCouncil.tsx - NEW - Council selection screen
✅ app/_layout.tsx - Token validation on app load
✅ components/CouncilSwitcher.tsx - NEW - Council switching modal
```

---

## 💡 Implementation Complete!

All major functionality is now in place. Test thoroughly and adjust as needed!
