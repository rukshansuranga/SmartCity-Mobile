# Maestro Configuration for SmartCity Mobile App

This directory contains Maestro test flows for the SmartCity mobile application.

## Test Structure

- **smoke/**: Basic smoke tests to ensure core functionality works
- **flows/**: Detailed user journey tests
- **config/**: Configuration files and test data

### Reusable Flows

Some flows are designed to be reusable across multiple test scenarios:

- **comment-flow.yaml**: Reusable flow for testing comment functionality on any entity
  - Can be included in other flows using `runFlow: comment-flow.yaml`
  - Prerequisites: Should be on a screen where a comment button is visible
  - See `COMMENT_FLOW_GUIDE.md` for detailed usage instructions

### Available Test Flows

#### Authentication

- `auth-flow.yaml` - Sign in/sign up flows

#### User Management

- `user-profile-flow.yaml` - Profile viewing and editing

#### Complains Module

- `general-complains-flow.yaml` - Create and view general complains
- `general-complains-with-comments-flow.yaml` - General complains with comment testing
- `lightpost-complains-flow.yaml` - Create and view light post complains
- `lightpost-complains-with-comments-flow.yaml` - Light post complains with comment testing

#### Other Modules

- `projects-flow.yaml` - Project management flows
- `garbage-flow.yaml` - Garbage tracking flows
- `navigation-flow.yaml` - App navigation testing
- `error-handling-flow.yaml` - Error scenarios

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

# Run regression suite
maestro test maestro/suites/regression-suite.yaml
```

### Documentation

- **[QUICK_START_COMMENTS.md](QUICK_START_COMMENTS.md)** - Quick guide to add comment testing (3 steps!)
- **[COMMENT_FLOW_GUIDE.md](flows/COMMENT_FLOW_GUIDE.md)** - Detailed comment flow documentation
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - Visual architecture and flow diagrams
- **[COMMENT_TESTING_SUMMARY.md](COMMENT_TESTING_SUMMARY.md)** - Implementation summary

## Test Coverage

### Core Features

- [ ] Authentication (Sign In/Sign Up)
- [ ] User Profile Management
- [ ] Navigation between main sections

### Complains Module

- [x] General Complains (Add/List/View)
- [x] General Complains with Comments
- [x] Light Post Complains with Comments
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
