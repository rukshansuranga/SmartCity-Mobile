# VS Code Debugging Setup for Expo/React Native Project

## Debug Configurations Available

### 1. **Start Expo Development Server**

- Launches the Expo development server
- Use this to start your development environment
- Access the app via Expo Go app on your device or simulators

### 2. **Start Expo Web**

- Launches the web version of your Expo app
- Opens in browser at http://localhost:19006
- Good for debugging web-specific functionality

### 3. **Debug TypeScript Files**

- Debug individual TypeScript files
- Set breakpoints in your .ts/.tsx files
- Use this to debug API actions, utility functions, etc.

### 4. **Attach to Chrome (Web Debug)**

- Attach to Chrome DevTools for web debugging
- Requires Chrome to be started with `--remote-debugging-port=9222`
- Best for debugging React components in web environment

## How to Debug

### For Mobile App Development:

1. Use the "Start Expo Development Server" configuration
2. Set breakpoints in your React Native components
3. Open Expo Go on your device and scan the QR code
4. Use Chrome DevTools or Flipper for more advanced debugging

### For Web Development:

1. Use the "Start Expo Web" configuration
2. Set breakpoints in your React components
3. Open browser developer tools (F12) for debugging

### For Backend/API Debugging:

1. Open any TypeScript file in your `api/` folder
2. Set breakpoints where needed
3. Use "Debug TypeScript Files" configuration
4. Or use "Debug Current File" option from the Run and Debug panel

### For React Components:

1. Set breakpoints in your component files (.tsx)
2. Use "Start Expo Web" for web debugging
3. Open browser DevTools for console and network debugging

## Breakpoint Tips:

- Click in the left margin next to line numbers to set breakpoints
- Use conditional breakpoints (right-click on breakpoint)
- Use logpoints to log without stopping execution
- Use the Debug Console to evaluate expressions while paused

## Debugging Your Current File (commentAction.ts):

1. Open `api/commentAction.ts`
2. Set breakpoints on the lines you want to debug
3. Use "Debug TypeScript Files" configuration to run the file
4. Or import and call the functions from another file and debug that way

## Additional Extensions to Install:

- React Native Tools (ms-vscode.vscode-react-native)
- Expo Tools (expo.vscode-expo-tools)
- ES7+ React/Redux/React-Native snippets

## Troubleshooting:

- If debugging doesn't work, ensure all dependencies are installed: `npm install`
- For mobile debugging, make sure your device and computer are on the same network
- For web debugging, ensure the development server is running on port 19006
