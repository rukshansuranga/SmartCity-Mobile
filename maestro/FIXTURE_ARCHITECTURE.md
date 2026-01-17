# Test Fixture Management Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         MAESTRO TEST FLOW                               │
│                    (general-complains-with-fixtures.yaml)               │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ 1. Initialize
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      STEP 1: Generate Test ID                           │
│                                                                          │
│  - runScript: |                                                          │
│      const fixtureManager = require('./scripts/fixtureManager.js');     │
│      const testId = fixtureManager.generateTestId('E2E-GC');            │
│      output.testId = testId;  // E2E-GC-1699564800000-x8k2p9a1b         │
│      output.subject = `Road Issue ${testId}`;                           │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ 2. Execute Test
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      STEP 2: UI Interactions                             │
│                                                                          │
│  - launchApp                                                             │
│  - tapOn: "Sign In"                                                      │
│  - inputText: "${output.subject}"  ← Uses test ID                       │
│  - tapOn: "Submit"                                                       │
│  - assertVisible: "Success"                                              │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ 3. Save Fixture
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      STEP 3: Save to Backend                             │
│                                                                          │
│  - runScript: |                                                          │
│      fixtureManager.saveGeneralComplainFixture({                        │
│        testId: output.testId,                                            │
│        subject: output.subject,                                          │
│        detail: 'Detail text',                                            │
│        additionalData: { ... }                                           │
│      });                                                                 │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      FIXTURE MANAGER                                     │
│                 (maestro/scripts/fixtureManager.js)                      │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────┐         │
│  │  Core Functions                                             │         │
│  │  • generateTestId(prefix)                                   │         │
│  │  • generateFixtureKey(scenario, testId)                     │         │
│  │  • saveFixture(params)                                      │         │
│  │  • updateFixture(key, data)                                 │         │
│  └────────────────────────────────────────────────────────────┘         │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────┐         │
│  │  Specialized Functions                                      │         │
│  │  • saveGeneralComplainFixture(params)                       │         │
│  │  • saveLightPostComplainFixture(params)                     │         │
│  │  • saveProjectComplainFixture(params)                       │         │
│  └────────────────────────────────────────────────────────────┘         │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ HTTP POST
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      BACKEND API                                         │
│                  (http://localhost:5000/api/testfixture)                 │
│                                                                          │
│  POST /api/testfixture           PATCH /api/testfixture/:key            │
│  └─> Create new fixture           └─> Update existing fixture           │
│                                                                          │
│  Request:                         Request:                               │
│  {                                {                                      │
│    "key": "general-complain-...", "complainId": "CMP-123",              │
│    "scenarioName": "...",          "status": "submitted"                │
│    "data": { ... },              }                                      │
│    "testRunId": "E2E-123"                                               │
│  }                                                                       │
│                                                                          │
│  Response:                        Response:                              │
│  {                                {                                      │
│    "id": "fixture-uuid",           "id": "fixture-uuid",                │
│    "key": "general-complain-...",  "updated": true                      │
│    "createdAt": "2024-11-09..."  }                                      │
│  }                                                                       │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      DATABASE                                            │
│                                                                          │
│  test_fixtures                                                           │
│  ├─ id: "fixture-uuid"                                                   │
│  ├─ key: "general-complain-E2E-GC-1699564800000-x8k2p9a1b"              │
│  ├─ scenarioName: "Create General Complain"                             │
│  ├─ data: { complain: {...}, testRunId: "...", ... }                    │
│  ├─ testRunId: "E2E-GC-1699564800000-x8k2p9a1b"                         │
│  ├─ environment: "local"                                                 │
│  ├─ createdBy: "maestro"                                                 │
│  └─ timestamp: "2024-11-09T10:30:00.000Z"                               │
└─────────────────────────────────────────────────────────────────────────┘
```

## Data Flow Example

### 1. Test Initialization

```javascript
testId = "E2E-GC-1699564800000-x8k2p9a1b";
fixtureKey = "general-complain-E2E-GC-1699564800000-x8k2p9a1b";
subject = "Road Maintenance Issue E2E-GC-1699564800000-x8k2p9a1b";
```

### 2. UI Interaction

```
User fills form with subject containing test ID
Subject: "Road Maintenance Issue E2E-GC-1699564800000-x8k2p9a1b"
Detail: "Potholes need attention. Test: E2E-GC-1699564800000-x8k2p9a1b"
```

### 3. Fixture Save

```javascript
saveGeneralComplainFixture({
  testId: "E2E-GC-1699564800000-x8k2p9a1b",
  subject: "Road Maintenance Issue E2E-GC-1699564800000-x8k2p9a1b",
  detail: "Potholes need attention...",
  complainId: null,
  additionalData: {
    council: "Mahara",
    user: "amal",
    hasAttachment: true,
  },
});
```

### 4. Backend Storage

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "key": "general-complain-E2E-GC-1699564800000-x8k2p9a1b",
  "scenarioName": "Create General Complain",
  "data": {
    "complain": {
      "subject": "Road Maintenance Issue E2E-GC-1699564800000-x8k2p9a1b",
      "detail": "Potholes need attention...",
      "complainType": "GeneralComplain",
      "complainId": null
    },
    "testRunId": "E2E-GC-1699564800000-x8k2p9a1b",
    "council": "Mahara",
    "user": "amal",
    "hasAttachment": true
  },
  "environment": "local",
  "createdBy": "maestro",
  "timestamp": "2024-11-09T10:30:00.000Z"
}
```

## File Structure

```
SmartCityMobile/
├── package.json                 (Updated with axios & test scripts)
│
└── maestro/
    ├── scripts/
    │   ├── fixtureManager.js              ← Core fixture manager
    │   └── fixtureManager.examples.js     ← Usage examples
    │
    ├── flows/
    │   ├── general-complains-flow.yaml              (Original)
    │   ├── general-complains-with-fixtures.yaml     (New with fixtures)
    │   ├── lightpost-complains-with-fixtures.yaml   (New with fixtures)
    │   └── project-complains-with-fixtures.yaml     (New with fixtures)
    │
    ├── config/
    │   └── fixture-config.yaml            ← Environment configuration
    │
    ├── screenshots/                       ← Test screenshots
    │
    └── docs/
        ├── README-FIXTURES.md                   ← Full documentation
        ├── QUICK_START_FIXTURES.md              ← Quick start guide
        ├── FIXTURE_IMPLEMENTATION_SUMMARY.md    ← Implementation summary
        └── FIXTURE_ARCHITECTURE.md              ← This file
```

## Component Responsibilities

### 1. Fixture Manager (fixtureManager.js)

- ✅ Generate unique test IDs
- ✅ Create fixture keys
- ✅ Save fixtures to backend API
- ✅ Update existing fixtures
- ✅ Handle errors gracefully
- ✅ Provide specialized functions for each complain type

### 2. Test Flows (\*.yaml)

- ✅ Initialize test data
- ✅ Execute UI interactions
- ✅ Call fixture manager to save data
- ✅ Verify test success

### 3. Backend API (/api/testfixture)

- ✅ Receive fixture data
- ✅ Validate data
- ✅ Store in database
- ✅ Return fixture ID
- ✅ Support updates

## Configuration Flow

```
Environment Variables          Fixture Manager Config          Backend API
┌──────────────────┐          ┌──────────────────┐          ┌─────────────┐
│ FIXTURE_API_URL  │────────>│ baseURL          │────────>│ API Endpoint │
│ TEST_ENV         │────────>│ environment      │────────>│ Environment  │
└──────────────────┘          └──────────────────┘          └─────────────┘
```

## Error Handling Flow

```
Fixture Save Attempt
        │
        ├─> Success ───> Log success ───> Continue test
        │
        └─> Failure ───> Log error ────> Continue test (don't fail)
                            │
                            └─> {
                                  success: false,
                                  error: "error message"
                                }
```

## Multi-Environment Support

```
┌─────────────────────────────────────────────────────────────────┐
│                    Test Execution                                │
└─────────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│   LOCAL      │      │     DEV      │      │   STAGING    │
│              │      │              │      │              │
│ localhost    │      │ dev-api.com  │      │ staging.com  │
│ :5000        │      │              │      │              │
└──────────────┘      └──────────────┘      └──────────────┘

Set via:
export FIXTURE_API_URL=http://dev-api.com
export TEST_ENV=dev
```

## Update Flow Example

```
1. Create Fixture                2. App Creates Complain
   (complainId: null)               (API returns ID: "CMP-123")
          │                                  │
          ▼                                  ▼
   ┌──────────────┐                 ┌──────────────┐
   │  Backend     │                 │   Mobile     │
   │  Saves       │                 │   App API    │
   │  Fixture     │                 │              │
   └──────────────┘                 └──────────────┘
          │                                  │
          └─────────────┬────────────────────┘
                        │
                        ▼
              3. Update Fixture
                 (complainId: "CMP-123")
                        │
                        ▼
                 ┌──────────────┐
                 │   Backend    │
                 │   Updates    │
                 │   Fixture    │
                 └──────────────┘
```

## Benefits Visualization

```
BEFORE (Without Centralization)
════════════════════════════════
Flow 1: axios.post(...) ─┐
Flow 2: axios.post(...) ─┼─> Duplicate code
Flow 3: axios.post(...) ─┤    Different structures
Flow 4: axios.post(...) ─┘    Hard to maintain


AFTER (With Centralization)
═══════════════════════════
Flow 1 ─┐
Flow 2 ─┼─> fixtureManager ─> Backend
Flow 3 ─┤    • Reusable
Flow 4 ─┘    • Consistent
             • Maintainable
```

## Testing Pattern

```
┌─────────────────────────────────────────────────────────────┐
│  1. Initialize                                               │
│     testId = generateTestId()                                │
│     testData = prepareTestData(testId)                       │
└─────────────────────────────────────────────────────────────┘
                         │
┌─────────────────────────────────────────────────────────────┐
│  2. Execute                                                  │
│     Login → Navigate → Fill Form → Submit                    │
│     (Use testId in form data for traceability)               │
└─────────────────────────────────────────────────────────────┘
                         │
┌─────────────────────────────────────────────────────────────┐
│  3. Verify                                                   │
│     Assert success → Verify testId in UI                     │
└─────────────────────────────────────────────────────────────┘
                         │
┌─────────────────────────────────────────────────────────────┐
│  4. Save Fixture                                             │
│     saveFixture(testData) → Backend → Database               │
│     (Don't fail test if fixture save fails)                  │
└─────────────────────────────────────────────────────────────┘
```

---

This architecture provides a scalable, maintainable solution for test fixture management
across all E2E test flows in the SmartCity Mobile application.
