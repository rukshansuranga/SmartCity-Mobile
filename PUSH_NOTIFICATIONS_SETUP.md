# Push Notifications Setup for Android

## The Issue
You're seeing this error because Expo push notifications on Android require **Firebase Cloud Messaging (FCM)**, which is not configured in your app.

## Solution Options

### Option 1: Use EAS Build (Recommended) ✅

EAS Build automatically configures FCM for you. This is the easiest and recommended approach.

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure EAS Build
eas build:configure

# Build for Android
eas build --platform android --profile preview
```

With EAS Build, Firebase is automatically configured and you don't need to manually set up `google-services.json`.

### Option 2: Manual FCM Setup (Development Only) 🔧

If you need to test push notifications in development builds:

1. **Create a Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project or use existing one
   - Add an Android app with package name: `com.rukshansuranga.smartcity`

2. **Download google-services.json**
   - In Firebase Console, download the `google-services.json` file
   - Place it in: `android/app/google-services.json`

3. **Update android/build.gradle**
   Add this to `dependencies` section:
   ```gradle
   classpath('com.google.gms:google-services:4.3.15')
   ```

4. **Update android/app/build.gradle**
   Add at the bottom of the file:
   ```gradle
   apply plugin: 'com.google.gms.google-services'
   ```

5. **Rebuild the app**
   ```bash
   npx expo run:android
   ```

## Current Status

Push notifications are **optional** and the app will work fine without them. Users just won't receive:
- News update notifications
- Complaint status notifications
- System announcements

## For Production

Always use **EAS Build** for production releases. It handles:
- FCM configuration
- Code signing
- Optimized builds
- Over-the-air updates

## Testing Push Notifications

Once configured, test with:
1. Physical Android device (not emulator)
2. Grant notification permissions when prompted
3. Check console logs for success messages
4. Send a test notification from your backend

## Resources

- [Expo Push Notifications Guide](https://docs.expo.dev/push-notifications/overview/)
- [Firebase Console](https://console.firebase.google.com/)
- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
