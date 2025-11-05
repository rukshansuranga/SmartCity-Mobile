# 🚀 Quick Start Guide - Council Selection Feature

## ✅ What Was Implemented

### **Core Features:**

1. ✅ Mandatory council selection on first login/registration
2. ✅ Automatic token refresh (5 min before expiry)
3. ✅ Council ID sent with every API request
4. ✅ Council switching capability
5. ✅ Token validation on app restart
6. ✅ Secure token storage

---

## 📝 Before You Start

### **1. Configure Keycloak**

Follow the guide in `KEYCLOAK_COUNCIL_SETUP.md` to:

- Add `councils` attribute to users
- Configure mappers
- Test userInfo endpoint

### **2. Update Backend**

Your backend should:

- Read `X-Council-Id` header from requests
- Switch database based on council ID
- Filter all data by council

Example Node.js middleware:

```javascript
app.use((req, res, next) => {
  const councilId = req.headers["x-council-id"];
  if (councilId) {
    req.councilId = councilId;
    // Switch database or add to queries
  }
  next();
});
```

---

## 🧪 Testing the Feature

### **Test 1: New User Registration**

```
1. Click "Sign Up" in mobile app
2. Complete Keycloak registration
3. Should redirect to council selection screen
4. Select a council
5. Should navigate to home screen
6. Verify council name shows in UI
```

### **Test 2: Existing User Login**

```
1. Login with existing user (with council already selected)
2. Should go directly to home
3. Check API requests include X-Council-Id header
```

### **Test 3: Token Refresh**

```
1. Login to app
2. Wait for token to expire (or manually set short expiry in Keycloak)
3. Make an API call (e.g., open notifications)
4. Token should refresh automatically
5. API call should succeed
```

### **Test 4: Council Switching**

```
1. Open home screen
2. Click council switcher button
3. Select different council
4. UI should update
5. Subsequent API calls should use new council ID
```

### **Test 5: App Restart with Valid Token**

```
1. Close app completely
2. Reopen app
3. Should go directly to home (no re-login)
4. Council should still be selected
```

### **Test 6: App Restart with Expired Token**

```
1. Login to app
2. Close app
3. Wait for token expiry
4. Reopen app
5. Token should refresh automatically
6. Should stay logged in
```

---

## 🔍 Debugging

### **Enable Debug Logs**

All components log with prefixes for easy filtering:

```javascript
// In Chrome DevTools or React Native Debugger, filter by:
[DEBUG][TokenManager][RootLayout][SelectCouncil][CouncilSwitcher]; // signIn.tsx logs // Token refresh logs // App initialization logs // Council selection logs // Council switching logs
```

### **Check Auth Store State**

```javascript
// In React Native Debugger console:
const state = require("@/stores/authStore").useAuthStore.getState();
console.log("Auth State:", {
  isSignedIn: state.isSignedIn,
  hasCouncil: !!state.selectedCouncil,
  tokenExpiry: new Date(state.tokenExpiresAt),
  isExpired: state.isTokenExpired(),
});
```

### **Check API Headers**

Use a proxy like Charles or mitmproxy to inspect:

```
Authorization: Bearer eyJhbGc...
X-Council-Id: colombo
```

---

## 🎨 Customize UI (Optional)

### **Add Council Info to Home Screen**

See `example-home-with-council-switcher.tsx` for full example.

Quick snippet:

```tsx
import { useAuthStore } from "@/stores/authStore";

const { selectedCouncil } = useAuthStore();

<Text>Current Council: {selectedCouncil?.label}</Text>;
```

### **Add Council Switcher to Profile**

```tsx
import CouncilSwitcher from "@/components/CouncilSwitcher";
import { useState } from "react";

const [showSwitcher, setShowSwitcher] = useState(false);

<Button onPress={() => setShowSwitcher(true)}>
  Switch Council
</Button>

<CouncilSwitcher
  visible={showSwitcher}
  onDismiss={() => setShowSwitcher(false)}
/>
```

---

## 📊 Monitor Token Refresh

### **Check Expiry Time**

```tsx
const { tokenExpiresAt } = useAuthStore();
const timeLeft = tokenExpiresAt ? tokenExpiresAt - Date.now() : 0;
console.log(`Token expires in ${Math.floor(timeLeft / 1000 / 60)} minutes`);
```

### **Force Refresh (for testing)**

```typescript
import { refreshAccessToken } from "@/lib/tokenManager";

// In any component:
const testRefresh = async () => {
  const result = await refreshAccessToken();
  console.log("Refresh result:", result);
};
```

---

## 🐛 Common Issues

### **Issue: "No councils available"**

**Cause**: User in Keycloak doesn't have councils attribute

**Fix**:

1. Check Keycloak user attributes
2. Ensure mapper is configured
3. Verify userInfo endpoint response

### **Issue: Council not sent to backend**

**Cause**: selectedCouncil is null

**Fix**:

1. Ensure council was selected
2. Check auth store: `useAuthStore.getState().selectedCouncil`
3. Verify fetchWrapper includes header

### **Issue: Token refresh fails**

**Cause**: Refresh token expired or invalid

**Fix**:

1. Check Keycloak refresh token expiry settings
2. Verify refresh token in auth store
3. User will be logged out automatically

### **Issue: Stuck on select council screen**

**Cause**: Council selection not saving

**Fix**:

1. Check `setSelectedCouncil` is called
2. Verify zustand persist is working
3. Clear app data and retry

---

## 📱 Production Checklist

Before deploying:

- [ ] Keycloak configured with councils attribute
- [ ] All test users have councils assigned
- [ ] Backend reads X-Council-Id header
- [ ] Backend switches database correctly
- [ ] Token refresh tested thoroughly
- [ ] Council switching tested
- [ ] App restart scenarios tested
- [ ] Logged out user can't access app
- [ ] Error messages are user-friendly
- [ ] Loading states are smooth
- [ ] No console errors in production build

---

## 🆘 Need Help?

Refer to:

- `COUNCIL_REFACTOR_SUMMARY.md` - Full technical details
- `KEYCLOAK_COUNCIL_SETUP.md` - Keycloak configuration
- `example-home-with-council-switcher.tsx` - UI examples

---

## 🎉 You're Ready!

The council selection feature is fully implemented and ready to use!

**Next Steps:**

1. Configure Keycloak
2. Update backend to use X-Council-Id
3. Test thoroughly
4. Deploy! 🚀
