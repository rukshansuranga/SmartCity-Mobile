# 🚀 Quick Start Guide - Testing News Feature

## Prerequisites

- Physical device (iOS or Android) - **Simulators don't support push notifications**
- Backend API running and accessible
- Expo Go app or development build installed

## Step 1: Build and Run

### Option A: Development Build (Recommended for Notifications)

```bash
# Navigate to project directory
cd d:\SmartCiy\SmartCityMobile

# Build development client for Android
npx expo run:android

# OR for iOS
npx expo run:ios
```

### Option B: Expo Go (Limited notification support)

```bash
npx expo start
# Scan QR code with Expo Go app
```

## Step 2: Test Authentication Flow

### Login Test

1. Open the app
2. Tap "Sign In"
3. Complete Keycloak authentication
4. **Check console logs for**: `"✅ Device token registered successfully"`

### Signup Test

1. Open the app
2. Tap "Sign Up" (if available)
3. Complete registration
4. **Check console logs for**: `"✅ Device token registered after signup"`

## Step 3: Test News Feed

### View News List

1. From home screen, tap "News" card (orange, with newspaper icon)
2. You should see the news feed
3. **If no news**: Empty state with "📰 No news available"

### Pull to Refresh

1. On news feed, pull down
2. Should show loading spinner
3. News list refreshes

### Pagination

1. Scroll to bottom of news list
2. Should auto-load more news (if available)
3. **Check for**: Loading spinner at bottom

### Unread Badge

1. **On home screen**: News card should show red badge with unread count
2. **After reading news**: Badge count decreases

## Step 4: Test News Detail

### View News

1. Tap any news card
2. Should navigate to detail screen
3. Should show:
   - Cover image (if available)
   - Category and priority badges
   - Title and content
   - Published date
   - Media gallery (if available)

### Auto Mark as Read

1. View a news detail
2. Go back to news feed
3. That news should appear dimmer/read
4. Unread count should decrease

## Step 5: Test Push Notifications

### Check Device Token

```bash
# In terminal, check logs for:
"✅ Expo Push Token: ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]"
```

### Send Test Notification (Using Expo Push Tool)

1. Go to: https://expo.dev/notifications
2. Enter the ExponentPushToken from logs
3. Create notification:
   ```json
   {
     "to": "ExponentPushToken[your-token-here]",
     "title": "Breaking News!",
     "body": "City council announces new infrastructure project",
     "data": {
       "newsId": 1
     }
   }
   ```
4. Send notification

### Test Notification Scenarios

#### Foreground (App is Open)

1. Keep app open on news feed
2. Send test notification
3. **Should see**:
   - Banner appears at top
   - Unread count updates
   - Sound plays (if enabled)

#### Background (App is Minimized)

1. Minimize app (press home button)
2. Send test notification
3. **Should see**:
   - Notification in system tray
   - Badge on app icon (iOS)

#### Tap Notification

1. Send notification with `newsId` in data
2. Tap the notification
3. **Should**:
   - Open app
   - Navigate directly to that news detail
   - Mark news as read

#### Cold Start (App is Closed)

1. Force close app
2. Send test notification
3. Tap notification
4. **Should**:
   - Launch app
   - Navigate to news detail after 1 second delay

## Step 6: Test Logout

1. Tap logout button (top right)
2. **Check console logs for**: `"✅ Device token unregistered"`
3. App should redirect to auth screen

## 🐛 Troubleshooting

### No Device Token

**Problem**: Console shows "⚠️ Push notifications only work on physical devices"
**Solution**: Use a physical device, not simulator

### Permission Denied

**Problem**: Console shows "❌ Notification permission not granted"
**Solution**:

1. Go to device Settings → Apps → SmartCity → Notifications
2. Enable notifications
3. Restart app

### Token Registration Failed

**Problem**: Console shows "❌ Failed to register device token"
**Solution**:

1. Check backend API is running
2. Verify backend URL in `.env` or `fetchWrapper.ts`
3. Check network connectivity
4. Review backend logs

### No News Displayed

**Problem**: Empty state shown but backend has news
**Solution**:

1. Check API response in network logs
2. Verify `residentId` matches backend data
3. Check if news is published (status = "Published")
4. Verify user has access to news

### Notification Not Received

**Problem**: Sent notification but device didn't receive
**Solution**:

1. Verify device token is correct
2. Check Expo Push Tool for delivery status
3. Ensure app is not in "Do Not Disturb" mode
4. Check notification permissions are granted

### Deep Link Not Working

**Problem**: Tap notification but doesn't navigate to news
**Solution**:

1. Verify `newsId` is included in notification `data` field
2. Check console logs for navigation errors
3. Ensure news exists in backend

## ✅ Testing Checklist

- [ ] Device token registered on login
- [ ] Device token registered on signup
- [ ] Device token unregistered on logout
- [ ] News feed loads successfully
- [ ] Pull-to-refresh works
- [ ] Pagination loads more news
- [ ] Unread badge shows on home screen
- [ ] News detail opens correctly
- [ ] News marked as read on view
- [ ] Unread count decreases after reading
- [ ] Foreground notification shows banner
- [ ] Background notification appears in tray
- [ ] Tap notification opens news detail
- [ ] Cold start from notification works
- [ ] Deep linking navigates to correct news

## 📊 Expected Console Logs

### On Login

```
[DEBUG] logIn called successfully
🔑 Generating Expo push token...
✅ Expo Push Token: ExponentPushToken[...]
📤 Registering token with backend (Android)...
✅ Device token registered successfully
```

### On News Feed Load

```
Fetching news feed for resident xxx, page 1
✅ News feed loaded: 10 items
Fetching unread news count for resident xxx
✅ Unread count: 5
```

### On Notification Received (Foreground)

```
📬 Notification received: Object { ... }
Fetching unread news count for resident xxx
✅ Unread count updated
```

### On Notification Tap

```
🔔 Notification tapped, newsId: 123
Fetching news detail: 123 for resident xxx
✅ Navigating to news detail
```

### On Logout

```
Logging out...
🗑️ Unregistering device token...
✅ Device token unregistered
```

## 🎉 Success Criteria

If all tests pass, you should be able to:

1. ✅ View news feed with categories and priorities
2. ✅ See unread badge on home screen
3. ✅ Read full news with media
4. ✅ Receive push notifications
5. ✅ Navigate to news from notifications
6. ✅ Have token automatically managed on login/logout

---

**Happy Testing! 🚀**
