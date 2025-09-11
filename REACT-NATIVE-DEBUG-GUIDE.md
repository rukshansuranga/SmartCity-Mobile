# React Native/Expo Debugging Guide

## 🚨 **Important: React Native Debugging is Different!**

Unlike regular Node.js applications, React Native apps run in a JavaScript engine (Hermes/JSC) on mobile devices or in Metro bundler for web. This means traditional VS Code breakpoints won't work directly in your React components.

## ✅ **Working Debugging Methods:**

### 1. **Console Debugging (Easiest)**

```javascript
// In your AddGeneralComplain.tsx
async function addGeneralComplainHandler() {
  console.log("🔍 Starting addGeneralComplainHandler");
  console.log("📊 Form data:", { title, description, isPrivate });

  try {
    const complain = {
      clientId: userInfo?.sub,
      subject: title,
      detail: description,
      isPrivate: isPrivate,
      status: WorkpackageStatus.New,
    };

    console.log("📤 Sending complain:", complain);
    const result = await addGeneralComplain(complain);
    console.log("📥 Received result:", result);

    // Rest of your code...
  } catch (error) {
    console.error("❌ Error:", error);
  }
}
```

### 2. **Debugger Statement (Works!)**

```javascript
// Add this line where you want to pause execution
debugger; // This will pause in Chrome DevTools or React Native Debugger
```

### 3. **React Native DevTools (Recommended)**

1. Install React Native DevTools:
   ```bash
   npx react-native-debugger-open
   ```
2. Or use Chrome DevTools:
   - Press `Ctrl+M` (Android) or `Cmd+D` (iOS) in your app
   - Select "Debug JS Remotely"
   - Open Chrome DevTools (F12)

### 4. **Flipper Integration**

1. Install Flipper: https://fbflipper.com/
2. Add Flipper to your project:
   ```bash
   npx @react-native-community/cli@latest init --template=https://github.com/facebook/flipper
   ```

### 5. **VS Code Web Debugging**

If you're using Expo Web (`expo start --web`):

1. Start your app with: "Start Expo Web (Debug Mode)"
2. Use: "Debug in Expo Go (Chrome DevTools)"
3. Set breakpoints in VS Code - they should work for web!

## 🎯 **For Your Current Issue:**

Since you're debugging `AddGeneralComplain.tsx`, here are the immediate steps:

### Method A: Console Debugging (Immediate)

1. Add console.log statements in your `addGeneralComplainHandler` function
2. Run your app and check the Metro console or device logs

### Method B: Chrome DevTools (Best for React)

1. Run: `expo start --web`
2. Open in browser
3. Press F12 for DevTools
4. Add `debugger;` statements in your code
5. Use the browser's debugger

### Method C: API Function Debugging (Your Original Goal)

For debugging the `commentAction.ts` and similar API files:

1. Use "Debug Test File" configuration
2. Create test functions that call your API methods
3. Set breakpoints in VS Code - these WILL work!

## 🔧 **Quick Fix for Your Current Setup:**

1. **For React Components**: Use console.log and Chrome DevTools
2. **For API Functions**: Use VS Code debugger with test files
3. **For Full App Debugging**: Use React Native Debugger or Flipper

## 📱 **Mobile Device Debugging:**

- Shake device or press volume buttons
- Select "Debug JS Remotely"
- Use Chrome DevTools at chrome://inspect

## 🌐 **Web Debugging:**

- Use "Start Expo Web (Debug Mode)" configuration
- Set breakpoints in VS Code
- They should work properly for web builds!
