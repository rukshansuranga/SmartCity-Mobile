# Test Fixture Management for Maestro E2E Tests

## Overview

This directory contains centralized test fixture management utilities for Maestro E2E tests. The fixture manager provides reusable methods to save test data to the backend API, making it easy to track and manage test scenarios across mobile and portal applications.

## Architecture

```
maestro/
├── scripts/
│   └── fixtureManager.js          # Centralized fixture management utilities
├── flows/
│   ├── general-complains-with-fixtures.yaml
│   ├── lightpost-complains-with-fixtures.yaml
│   └── project-complains-with-fixtures.yaml
└── README-FIXTURES.md             # This file
```

## Fixture Manager API

### Core Functions

#### `generateTestId(prefix = 'E2E')`

Generates a unique test ID with optional prefix.

```javascript
const testId = fixtureManager.generateTestId("E2E-GC");
// Returns: "E2E-GC-1699564800000-x8k2p9a1b"
```

#### `generateFixtureKey(scenario, testId)`

Creates a fixture key based on scenario and test ID.

```javascript
const key = fixtureManager.generateFixtureKey("general-complain", testId);
// Returns: "general-complain-E2E-GC-1699564800000-x8k2p9a1b"
```

#### `saveFixture(params)`

Generic function to save any test fixture.

**Parameters:**

- `key` (string, required): Unique fixture key
- `scenarioName` (string, required): Name of the test scenario
- `scenarioDescription` (string, optional): Description of the scenario
- `data` (object, required): Test fixture data
- `testRunId` (string, required): Test run identifier
- `createdBy` (string, optional): Who created the fixture (default: 'maestro')

```javascript
await fixtureManager.saveFixture({
  key: "my-scenario-test-123",
  scenarioName: "User Login Flow",
  scenarioDescription: "Test user authentication",
  data: { username: "testuser", timestamp: new Date() },
  testRunId: "E2E-123",
  createdBy: "maestro",
});
```

### Specialized Functions

#### `saveGeneralComplainFixture(params)`

Saves a general complain test fixture.

```javascript
await fixtureManager.saveGeneralComplainFixture({
  testId: "E2E-123",
  subject: "Road Maintenance Issue",
  detail: "Potholes need repair",
  complainId: null, // Can be updated later
  additionalData: {
    council: "Mahara",
    user: "amal",
    hasAttachment: true,
  },
});
```

#### `saveLightPostComplainFixture(params)`

Saves a light post complain test fixture.

```javascript
await fixtureManager.saveLightPostComplainFixture({
  testId: "E2E-124",
  subject: "Street Light Not Working",
  detail: "Light post #LP-001 is not functioning",
  lightPostId: "LP-001",
  complainId: null,
});
```

#### `saveProjectComplainFixture(params)`

Saves a project complain test fixture.

```javascript
await fixtureManager.saveProjectComplainFixture({
  testId: "E2E-125",
  subject: "Project Delay Issue",
  detail: "Construction project behind schedule",
  projectId: "PRJ-456",
  complainId: null,
});
```

#### `updateFixture(fixtureKey, updateData)`

Updates an existing fixture with new data.

```javascript
await fixtureManager.updateFixture("general-complain-E2E-123", {
  complainId: "CMP-789",
  status: "submitted",
});
```

## Usage in Maestro Flows

### Basic Pattern

```yaml
---
appId: com.rukshansuranga.smartcity
name: Test Flow with Fixtures
---
# Step 1: Initialize test data
- runScript: |
    const fixtureManager = require('./scripts/fixtureManager.js');

    const testId = fixtureManager.generateTestId('E2E-TEST');
    output.testId = testId;
    output.fixtureKey = fixtureManager.generateFixtureKey('my-scenario', testId);

    console.log(`Test ID: ${testId}`);

# Step 2: Perform test actions
- launchApp
- tapOn: "Some Button"
# ... more test steps ...

# Step 3: Save fixture after successful action
- runScript: |
    const fixtureManager = require('./scripts/fixtureManager.js');

    fixtureManager.saveFixture({
      key: output.fixtureKey,
      scenarioName: 'My Test Scenario',
      data: { /* your test data */ },
      testRunId: output.testId
    })
    .then(result => {
      if (result.success) {
        console.log(`✓ Fixture saved: ${result.fixtureId}`);
      }
    });
```

### Example: General Complain Flow

See `flows/general-complains-with-fixtures.yaml` for a complete example.

Key steps:

1. Generate test ID and fixture key at the start
2. Use test ID in form inputs to make data traceable
3. Save fixture after successful complain creation
4. Include additional metadata (council, user, attachments, etc.)

## Configuration

### Environment Variables

Set these environment variables to configure the fixture manager:

```bash
# API endpoint (default: http://localhost:5000)
export FIXTURE_API_URL=http://localhost:5000

# Test environment (default: local)
export TEST_ENV=local  # or 'dev', 'staging', 'prod'
```

### API Configuration

Edit `maestro/scripts/fixtureManager.js` to modify:

```javascript
const FIXTURE_API_CONFIG = {
  baseURL: process.env.FIXTURE_API_URL || "http://localhost:5000",
  endpoint: "/api/testfixture",
  timeout: 10000,
  environment: process.env.TEST_ENV || "local",
};
```

## Backend API Requirements

The fixture manager expects a REST API with these endpoints:

### POST /api/testfixture

Create a new test fixture.

**Request Body:**

```json
{
  "key": "general-complain-E2E-123",
  "scenarioName": "Create General Complain",
  "scenarioDescription": "Mobile app creates general complain",
  "data": {
    "complain": {
      "subject": "Road Maintenance Issue",
      "detail": "Potholes need repair",
      "complainType": "GeneralComplain",
      "complainId": null
    },
    "testRunId": "E2E-123"
  },
  "createdBy": "maestro",
  "testRunId": "E2E-123",
  "environment": "local",
  "timestamp": "2024-11-09T10:30:00.000Z"
}
```

**Response:**

```json
{
  "id": "fixture-uuid-here",
  "key": "general-complain-E2E-123",
  "scenarioName": "Create General Complain",
  "createdAt": "2024-11-09T10:30:00.000Z"
}
```

### PATCH /api/testfixture/:key

Update an existing fixture.

**Request Body:**

```json
{
  "complainId": "CMP-789",
  "status": "submitted"
}
```

## Best Practices

### 1. Generate Unique Test IDs

Always use `generateTestId()` to create unique identifiers:

```javascript
const testId = fixtureManager.generateTestId("E2E-GC");
```

### 2. Include Test ID in Test Data

Add the test ID to form inputs to make data traceable:

```yaml
- inputText: "Road Maintenance Issue ${output.testId}"
```

### 3. Save Fixtures After Success

Only save fixtures after confirming the action was successful:

```yaml
- assertVisible: "Success Message"
- runScript: |
    // Now save the fixture
    fixtureManager.saveGeneralComplainFixture({ ... });
```

### 4. Include Rich Metadata

Add contextual information to fixtures:

```javascript
additionalData: {
  council: 'Mahara',
  user: 'amal',
  hasAttachment: true,
  attachmentName: 'test-document.pdf',
  createdAt: new Date().toISOString(),
  testType: 'e2e-mobile'
}
```

### 5. Handle Errors Gracefully

Fixture save failures shouldn't break the test:

```javascript
.then(result => {
  if (result.success) {
    console.log(`✓ Fixture saved: ${result.fixtureId}`);
  } else {
    console.log(`✗ Fixture save failed: ${result.error}`);
    // Test continues regardless
  }
})
.catch(error => {
  console.error(`Exception: ${error.message}`);
});
```

### 6. Update Fixtures When IDs Are Available

If you get IDs from API responses, update the fixture:

```javascript
// After API call returns complainId
await fixtureManager.updateFixture(output.fixtureKey, {
  complainId: responseData.complainId,
});
```

## Testing the Fixture Manager

### Prerequisites

```bash
# Install dependencies
npm install axios

# Ensure backend API is running
# Backend should be accessible at http://localhost:5000
```

### Run a Test Flow

```bash
# Run general complain flow with fixtures
maestro test maestro/flows/general-complains-with-fixtures.yaml

# Run with custom environment
export FIXTURE_API_URL=http://staging-api.example.com
export TEST_ENV=staging
maestro test maestro/flows/general-complains-with-fixtures.yaml
```

## Troubleshooting

### Fixture Save Fails

- Check if backend API is running
- Verify `FIXTURE_API_URL` is correct
- Check network connectivity
- Review API logs for errors

### Module Not Found Error

```
Error: Cannot find module './scripts/fixtureManager.js'
```

- Ensure the script path is relative to the flow file
- Use `require('./scripts/fixtureManager.js')` not absolute paths

### Timeout Errors

Increase timeout in `fixtureManager.js`:

```javascript
const FIXTURE_API_CONFIG = {
  timeout: 20000, // Increase to 20 seconds
};
```

## Migration Guide

### Converting Existing Flows

**Before:**

```yaml
- runScript: |
    const axios = require('axios');
    axios.post('http://localhost:5000/api/testfixture', {
      key: `test-${Date.now()}`,
      data: { /* ... */ }
    });
```

**After:**

```yaml
- runScript: |
    const fixtureManager = require('./scripts/fixtureManager.js');

    const testId = fixtureManager.generateTestId();
    output.testId = testId;

# Later in the flow:
- runScript: |
    const fixtureManager = require('./scripts/fixtureManager.js');
    fixtureManager.saveGeneralComplainFixture({
      testId: output.testId,
      subject: 'My subject',
      detail: 'My detail'
    });
```

## Examples

See the `flows/` directory for complete examples:

- `general-complains-with-fixtures.yaml` - General complain flow
- `lightpost-complains-with-fixtures.yaml` - Light post complain flow
- `project-complains-with-fixtures.yaml` - Project complain flow

## Support

For issues or questions:

1. Check the troubleshooting section
2. Review example flows in `flows/` directory
3. Check backend API logs
4. Review Maestro console output for error messages
