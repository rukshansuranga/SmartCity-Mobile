# Centralized Test Fixture Management - Implementation Summary

## Overview

This implementation provides a **centralized, reusable test fixture management system** for Maestro E2E tests. It eliminates code duplication and provides a consistent way to save test data to the backend API.

## 📁 Files Created

### Core Files

1. **`maestro/scripts/fixtureManager.js`** - Main fixture manager with reusable functions
2. **`maestro/scripts/fixtureManager.examples.js`** - Usage examples and patterns

### Test Flow Files

3. **`maestro/flows/general-complains-with-fixtures.yaml`** - General complain test with fixtures
4. **`maestro/flows/lightpost-complains-with-fixtures.yaml`** - Light post complain test with fixtures
5. **`maestro/flows/project-complains-with-fixtures.yaml`** - Project complain test with fixtures

### Documentation

6. **`maestro/README-FIXTURES.md`** - Comprehensive documentation
7. **`maestro/QUICK_START_FIXTURES.md`** - Quick start guide
8. **`maestro/config/fixture-config.yaml`** - Environment configuration

### Package Updates

9. **`package.json`** - Added axios dependency and test scripts

## 🎯 Key Features

### 1. Centralized Fixture Manager

- ✅ Single source of truth for fixture management
- ✅ Reusable functions across all test flows
- ✅ Type-safe and well-documented API
- ✅ Built-in error handling

### 2. Specialized Functions

```javascript
// General complain
saveGeneralComplainFixture({ testId, subject, detail, ... })

// Light post complain
saveLightPostComplainFixture({ testId, subject, detail, lightPostId, ... })

// Project complain
saveProjectComplainFixture({ testId, subject, detail, projectId, ... })

// Generic fixture
saveFixture({ key, scenarioName, data, testRunId, ... })
```

### 3. Unique Test IDs

```javascript
generateTestId("E2E-GC"); // E2E-GC-1699564800000-x8k2p9a1b
generateFixtureKey("general-complain", testId);
```

### 4. Rich Metadata Support

```javascript
additionalData: {
  council: 'Mahara',
  user: 'amal',
  hasAttachment: true,
  createdAt: new Date().toISOString(),
  testType: 'e2e-mobile'
}
```

### 5. Update Capability

```javascript
updateFixture(fixtureKey, { complainId: "CMP-123" });
```

## 🚀 Usage Pattern

### In Maestro YAML Files

```yaml
# 1. Initialize at start
- runScript: |
    const fixtureManager = require('./scripts/fixtureManager.js');
    const testId = fixtureManager.generateTestId('E2E-PREFIX');
    output.testId = testId;
    output.subject = `My Subject ${testId}`;

# 2. Use test data in UI
- inputText: "${output.subject}"

# 3. Save after success
- runScript: |
    const fixtureManager = require('./scripts/fixtureManager.js');
    fixtureManager.saveGeneralComplainFixture({
      testId: output.testId,
      subject: output.subject,
      detail: 'Detail text'
    });
```

## 📦 NPM Scripts Added

```json
{
  "test:fixtures:general": "maestro test maestro/flows/general-complains-with-fixtures.yaml",
  "test:fixtures:lightpost": "maestro test maestro/flows/lightpost-complains-with-fixtures.yaml",
  "test:fixtures:project": "maestro test maestro/flows/project-complains-with-fixtures.yaml"
}
```

## 🔧 Configuration

### Environment Variables

```bash
# API URL (default: http://localhost:5000)
export FIXTURE_API_URL=http://your-api-url

# Environment name (default: local)
export TEST_ENV=staging
```

### API Config (in fixtureManager.js)

```javascript
const FIXTURE_API_CONFIG = {
  baseURL: process.env.FIXTURE_API_URL || "http://localhost:5000",
  endpoint: "/api/testfixture",
  timeout: 10000,
  environment: process.env.TEST_ENV || "local",
};
```

## 📊 API Integration

### Expected Backend Endpoints

#### POST /api/testfixture

Creates a new fixture.

**Request:**

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
  "id": "fixture-uuid",
  "key": "general-complain-E2E-123",
  "scenarioName": "Create General Complain",
  "createdAt": "2024-11-09T10:30:00.000Z"
}
```

#### PATCH /api/testfixture/:key

Updates an existing fixture.

**Request:**

```json
{
  "complainId": "CMP-789",
  "status": "submitted"
}
```

## 🎓 Testing Your Original Flow

To convert your existing `general-complains-flow.yaml` to use fixtures:

### Option 1: Use the New Flow

```bash
npm run test:fixtures:general
```

### Option 2: Convert Your Existing Flow

Add these sections to your existing `general-complains-flow.yaml`:

**At the top (after appId/name):**

```yaml
# Initialize test fixture data
- runScript: |
    const fixtureManager = require('./scripts/fixtureManager.js');
    const testId = fixtureManager.generateTestId('E2E-GC');
    output.testId = testId;
    output.complainSubject = `Road Maintenance Issue ${testId}`;
    output.complainDetail = `Potholes need attention. Test: ${testId}`;
```

**Replace hardcoded text:**

```yaml
# Before:
- inputText: "Road Maintenance Issue ${new Date().getTime()}"

# After:
- inputText: "${output.complainSubject}"
```

**At the end (after successful submission):**

```yaml
# Save test fixture to backend
- runScript: |
    const fixtureManager = require('./scripts/fixtureManager.js');
    fixtureManager.saveGeneralComplainFixture({
      testId: output.testId,
      subject: output.complainSubject,
      detail: output.complainDetail,
      additionalData: {
        council: 'Mahara',
        user: 'amal',
        hasAttachment: true
      }
    })
    .then(result => {
      if (result.success) {
        console.log(`✓ Fixture saved: ${result.fixtureId}`);
      }
    });
```

## 📝 Next Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Ensure Backend is Running

```bash
# Your backend API should be running at:
http://localhost:5000/api/testfixture
```

### 3. Run a Test

```bash
npm run test:fixtures:general
```

### 4. Verify Fixture Saved

Check your backend API to see the saved fixture data.

### 5. Create More Test Flows

Use the provided templates to create additional test flows with fixtures.

## 🔍 Example Output

When you run a test, you'll see:

```
Test initialized: E2E-GC-1699564800000-x8k2p9a1b
Fixture key: general-complain-E2E-GC-1699564800000-x8k2p9a1b
✓ Test fixture saved successfully [ID: fixture-uuid-here]
  Key: general-complain-E2E-GC-1699564800000-x8k2p9a1b
  Scenario: Create General Complain
```

## 🎯 Benefits

1. **No Code Duplication** - Write fixture save logic once, use everywhere
2. **Consistent Structure** - All fixtures follow the same pattern
3. **Type Safety** - Clear parameter requirements and documentation
4. **Error Handling** - Built-in error handling that won't break tests
5. **Traceability** - Unique test IDs make it easy to track test data
6. **Flexibility** - Generic saveFixture() for custom scenarios
7. **Update Support** - Can update fixtures after initial creation
8. **Environment Support** - Easy to switch between environments
9. **Extensible** - Easy to add new fixture types

## 📚 Documentation Files

- **Quick Start**: `maestro/QUICK_START_FIXTURES.md`
- **Full Documentation**: `maestro/README-FIXTURES.md`
- **Code Examples**: `maestro/scripts/fixtureManager.examples.js`
- **Configuration**: `maestro/config/fixture-config.yaml`

## 🤝 Contributing

To add a new fixture type:

1. Add a new function in `fixtureManager.js`:

```javascript
async function saveMyNewFixture(params) {
  const { testId, ...otherParams } = params;
  const key = generateFixtureKey("my-new-type", testId);

  return await saveFixture({
    key,
    scenarioName: "My New Scenario",
    data: {
      /* your data structure */
    },
    testRunId: testId,
  });
}
```

2. Export the function:

```javascript
module.exports = {
  // ... existing exports
  saveMyNewFixture,
};
```

3. Create a test flow using the new function
4. Add documentation and examples

## ✅ Checklist

- [x] Core fixture manager created
- [x] Specialized functions for each complain type
- [x] Example test flows created
- [x] Comprehensive documentation
- [x] Quick start guide
- [x] Usage examples
- [x] Configuration files
- [x] NPM scripts added
- [x] axios dependency added
- [x] Error handling implemented
- [x] Update capability added
- [x] Environment support added

## 🎉 Ready to Use!

Your centralized test fixture management system is ready. Start by running:

```bash
npm install
npm run test:fixtures:general
```

---

**Questions or Issues?** Check the documentation files or review the example flows.
