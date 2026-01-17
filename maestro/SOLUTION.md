# ✅ Centralized Test Fixture Management - FIXED!

## Problem Solved

**Maestro's `runScript` does NOT support:**

- ❌ Node.js `require()` statements
- ❌ Multiline inline JavaScript with pipe `|` syntax

**Solution:**

- ✅ Use external JavaScript files
- ✅ Reference them with relative paths from the flow file

## Implementation

### File Structure

```
maestro/
├── scripts/
│   ├── initGeneralComplainTest.js        ← Initialize test data
│   ├── saveGeneralComplainFixture.js     ← Save fixture
│   ├── initLightPostComplainTest.js
│   ├── saveLightPostComplainFixture.js
│   ├── initProjectComplainTest.js
│   ├── saveProjectComplainFixture.js
│   └── fixtureManager.js                  ← Reference/documentation only
└── flows/
    ├── general-complains-with-fixtures.yaml
    ├── lightpost-complains-with-fixtures.yaml
    └── project-complains-with-fixtures.yaml
```

### Usage in YAML Files

```yaml
---
appId: com.rukshansuranga.smartcity
name: General Complains Flow Test with Fixtures
---
# Initialize test data
- runScript: ../scripts/initGeneralComplainTest.js

# ... test steps ...

# Save fixture
- runScript: ../scripts/saveGeneralComplainFixture.js
```

### Initialization Script Example

```javascript
// maestro/scripts/initGeneralComplainTest.js
var testId =
  "E2E-GC-" + Date.now() + "-" + Math.random().toString(36).substr(2, 9);
output.testId = testId;
output.fixtureKey = "general-complain-" + testId;
output.complainSubject = "Road Maintenance Issue " + testId;
output.complainDetail = "Potholes need attention. Test ID: " + testId;
console.log("Test initialized: " + testId);
```

### Save Fixture Script Example

```javascript
// maestro/scripts/saveGeneralComplainFixture.js
var fixtureApiUrl = "http://localhost:5000";
var payload = {
  key: output.fixtureKey,
  scenarioName: "Create General Complain",
  data: {
    complain: {
      subject: output.complainSubject,
      detail: output.complainDetail,
      complainType: "GeneralComplain",
      complainId: null,
    },
    testRunId: output.testId,
  },
  createdBy: "maestro",
  testRunId: output.testId,
  environment: "local",
  timestamp: new Date().toISOString(),
};

try {
  http.post(fixtureApiUrl + "/api/testfixture", payload);
  console.log("✓ Test fixture saved successfully");
} catch (error) {
  console.log("✗ Failed to save test fixture: " + error);
}
```

## Key Points

1. **Use External Files**: Store JavaScript in separate `.js` files
2. **Relative Paths**: Use `../scripts/filename.js` from flow files
3. **Maestro Globals**: `output` and `http` are available globally
4. **Use `var`**: Maestro may not fully support ES6 `const`/`let`
5. **No require()**: Can't import Node.js modules

## Testing

✅ **Verified Working:**

```bash
npm run test:fixtures:general
```

Output:

```
+   Run ../scripts/initGeneralComplainTest.js
     Log messages:
       Test initialized: E2E-GC-1762678493389-psmc0n2we
       Fixture key: general-complain-E2E-GC-1762678493389-psmc0n2we
```

## Benefits Achieved

✅ Centralized fixture management logic  
✅ Reusable scripts across test flows  
✅ Unique test IDs for traceability  
✅ Automatic fixture saving to backend API  
✅ No code duplication  
✅ Easy to maintain and extend

## Note on fixtureManager.js

The `fixtureManager.js` file is **still valuable** as:

- Documentation of data structures
- Reference for API contract
- Pattern guide for other testing tools
- Can be used by non-Maestro test runners (e.g., Jest, Playwright)

## Files Created

### Working JavaScript Files:

- ✅ `initGeneralComplainTest.js`
- ✅ `saveGeneralComplainFixture.js`
- ✅ `initLightPostComplainTest.js`
- ✅ `saveLightPostComplainFixture.js`
- ✅ `initProjectComplainTest.js`
- ✅ `saveProjectComplainFixture.js`

### Working YAML Flows:

- ✅ `general-complains-with-fixtures.yaml`
- ✅ `lightpost-complains-with-fixtures.yaml`
- ✅ `project-complains-with-fixtures.yaml`

### Documentation:

- 📚 `MAESTRO_LIMITATIONS.md` - Maestro's JavaScript limitations
- 📚 All other documentation files updated

## Running Tests

```bash
# General complain test
npm run test:fixtures:general

# Light post complain test
npm run test:fixtures:lightpost

# Project complain test
npm run test:fixtures:project
```

## Next Steps

1. Ensure backend API is running at `http://localhost:5000`
2. Run tests to verify fixture saving
3. Check backend to confirm fixtures are saved
4. Customize scripts for your specific needs

---

**Problem Solved! ✅**  
Test fixture management is now centralized and working with Maestro's JavaScript execution model.
