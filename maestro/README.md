# Maestro Configuration for SmartCity Mobile App

This directory contains Maestro test flows for the SmartCity mobile application.

## Test Structure

- **smoke/**: Basic smoke tests to ensure core functionality works
- **flows/**: Detailed user journey tests
- **config/**: Configuration files and test data

## Running Tests

### Prerequisites

1. Ensure Maestro CLI is installed: https://maestro.mobile.dev/getting-started/installing-maestro
2. Start your React Native app: `npm run android` or `npm run ios`
3. Ensure your device/emulator is connected

### Commands

```bash
# Run all smoke tests
maestro test maestro/smoke/

# Run specific test flow
maestro test maestro/flows/auth-flow.yaml

# Run all tests
maestro test maestro/

# Run tests with continuous mode (watches for changes)
maestro test maestro/ --continuous
```

## Test Coverage

### Core Features

- [ ] Authentication (Sign In/Sign Up)
- [ ] User Profile Management
- [ ] Navigation between main sections

### Complains Module

- [ ] General Complains (Add/List/View)
- [ ] Light Post Complains (Add/List/View/Details)
- [ ] Project Complains (Add/List/Select Project)

### Projects Module

- [ ] Project List/Detail View
- [ ] Project Feedback
- [ ] Road Projects

### Garbage Management

- [ ] Garbage Tracking
- [ ] Schedule Management

### Notifications

- [ ] Notification List View
- [ ] Notification Actions

## Test Data

Test data is stored in `config/test-data.yaml` and includes:

- Sample user credentials
- Test complain data
- Mock project information
