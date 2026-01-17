# Quick Start: Testing with Centralized Fixtures

This guide will help you quickly set up and run tests with centralized fixture management.

## Prerequisites

1. **Backend API Running**

   ```bash
   # Ensure your backend test fixture API is running at:
   http://localhost:5000

   # Or set custom URL:
   export FIXTURE_API_URL=http://your-api-url:port
   ```

2. **Install Dependencies**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Maestro Installed**

   ```bash
   # Check if Maestro is installed
   maestro --version

   # If not installed, run:
   ./scripts/install-maestro.ps1
   ```

## Running Tests with Fixtures

### Test General Complains

```bash
npm run test:fixtures:general
# or
maestro test maestro/flows/general-complains-with-fixtures.yaml
```

### Test Light Post Complains

```bash
npm run test:fixtures:lightpost
# or
maestro test maestro/flows/lightpost-complains-with-fixtures.yaml
```

### Test Project Complains

```bash
npm run test:fixtures:project
# or
maestro test maestro/flows/project-complains-with-fixtures.yaml
```

## What Happens During Test

1. **Test Initialization**
   - Generates unique test ID (e.g., `E2E-GC-1699564800000-x8k2p9a1b`)
   - Creates fixture key (e.g., `general-complain-E2E-GC-1699564800000-x8k2p9a1b`)
   - Prepares test data with test ID embedded

2. **Test Execution**
   - Performs UI actions (login, navigation, form filling)
   - Uses test ID in form inputs for traceability
   - Takes screenshots at key points

3. **Fixture Save**
   - After successful action, saves fixture to backend API
   - Includes all test data, metadata, and context
   - Logs success/failure to console

4. **Verification**
   - Confirms test ID appears in UI
   - Verifies test completed successfully

## Viewing Test Results

### Console Output

```
Test initialized: E2E-GC-1699564800000-x8k2p9a1b
Fixture key: general-complain-E2E-GC-1699564800000-x8k2p9a1b
✓ Test fixture saved successfully [ID: fixture-uuid-here]
  Key: general-complain-E2E-GC-1699564800000-x8k2p9a1b
  Scenario: Create General Complain
```

### Backend API

Check your backend API to see saved fixtures:

```bash
GET http://localhost:5000/api/testfixture
GET http://localhost:5000/api/testfixture/{key}
```

### Screenshots

View screenshots in `maestro/screenshots/`:

- `auth_screen.png`
- `general_complain_form.png`
- `general_complains_list_after_add.png`

## Customizing Tests

### Change API URL

```bash
export FIXTURE_API_URL=http://staging-api.example.com
npm run test:fixtures:general
```

### Change Environment

```bash
export TEST_ENV=staging
npm run test:fixtures:general
```

### Modify Test Data

Edit the flow file to customize test data:

```yaml
# maestro/flows/general-complains-with-fixtures.yaml
- runScript: |
    output.complainSubject = `Custom Subject ${testId}`;
    output.complainDetail = `Custom detail message here`;
```

## Creating New Test Flows with Fixtures

### 1. Start with Template

```yaml
---
appId: com.rukshansuranga.smartcity
name: My New Test Flow
---
# Initialize test
- runScript: |
    const fixtureManager = require('./scripts/fixtureManager.js');
    const testId = fixtureManager.generateTestId('E2E-MY');
    output.testId = testId;
    output.fixtureKey = fixtureManager.generateFixtureKey('my-scenario', testId);

# Your test steps here...

# Save fixture
- runScript: |
    const fixtureManager = require('./scripts/fixtureManager.js');
    fixtureManager.saveFixture({
      key: output.fixtureKey,
      scenarioName: 'My Test Scenario',
      data: { /* your data */ },
      testRunId: output.testId
    });
```

### 2. Use Specialized Functions

For common scenarios, use specialized functions:

```javascript
// General complain
fixtureManager.saveGeneralComplainFixture({
  testId: output.testId,
  subject: "My subject",
  detail: "My detail",
});

// Light post complain
fixtureManager.saveLightPostComplainFixture({
  testId: output.testId,
  subject: "My subject",
  detail: "My detail",
  lightPostId: "LP-001",
});

// Project complain
fixtureManager.saveProjectComplainFixture({
  testId: output.testId,
  subject: "My subject",
  detail: "My detail",
  projectId: "PRJ-001",
});
```

## Troubleshooting

### ❌ "Cannot find module './scripts/fixtureManager.js'"

**Solution:** Ensure you're running from the project root directory:

```bash
cd d:\SmartCiy\SmartCityMobile
maestro test maestro/flows/general-complains-with-fixtures.yaml
```

### ❌ "ECONNREFUSED" or connection errors

**Solution:** Ensure backend API is running:

```bash
# Check if backend is running
curl http://localhost:5000/api/testfixture
# or
Invoke-WebRequest http://localhost:5000/api/testfixture
```

### ❌ Fixture save fails but test continues

**Expected behavior.** Fixture save failures don't break tests. Check:

1. Backend API logs
2. Network connectivity
3. API endpoint configuration

### ❌ Test ID not appearing in UI

**Check:**

1. Form inputs are using `${output.testId}` correctly
2. Test ID was generated successfully (check console output)
3. UI rendering is complete before verification

## Best Practices

### ✅ Always Generate Unique Test IDs

```javascript
const testId = fixtureManager.generateTestId("E2E-PREFIX");
```

### ✅ Include Test ID in Test Data

```yaml
- inputText: "My Subject ${output.testId}"
```

### ✅ Save Fixtures After Success

```yaml
- assertVisible: "Success Message"
- runScript: |
    // Now save fixture
```

### ✅ Include Rich Metadata

```javascript
additionalData: {
  council: 'Mahara',
  user: 'amal',
  createdAt: new Date().toISOString(),
  testType: 'e2e-mobile'
}
```

### ✅ Handle Errors Gracefully

```javascript
.catch(error => {
  console.error(`Exception: ${error.message}`);
  // Test continues
});
```

## Next Steps

1. ✅ Run your first test with fixtures
2. 📚 Read full documentation: `maestro/README-FIXTURES.md`
3. 🔧 Customize fixture manager: `maestro/scripts/fixtureManager.js`
4. 📝 Create your own test flows using the templates
5. 🔄 Integrate with CI/CD pipeline

## Support

- Full documentation: `maestro/README-FIXTURES.md`
- Example flows: `maestro/flows/*-with-fixtures.yaml`
- Fixture manager code: `maestro/scripts/fixtureManager.js`

## Environment Variables Reference

| Variable          | Default                 | Description           |
| ----------------- | ----------------------- | --------------------- |
| `FIXTURE_API_URL` | `http://localhost:5000` | Backend API URL       |
| `TEST_ENV`        | `local`                 | Test environment name |

## NPM Scripts Reference

| Script                            | Description                             |
| --------------------------------- | --------------------------------------- |
| `npm run test:fixtures:general`   | Test general complains with fixtures    |
| `npm run test:fixtures:lightpost` | Test light post complains with fixtures |
| `npm run test:fixtures:project`   | Test project complains with fixtures    |

---

**Happy Testing! 🚀**
