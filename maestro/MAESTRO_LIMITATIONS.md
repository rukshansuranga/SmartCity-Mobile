# IMPORTANT: Maestro JavaScript Limitations

## Issue Discovered

Maestro's `runScript` command **does NOT support Node.js `require()` statements**.

The original implementation used:

```javascript
const fixtureManager = require("./scripts/fixtureManager.js"); // ❌ This doesn't work!
```

This causes the error:

```
java.nio.file.InvalidPathException: Illegal char < > at index 62
```

## Solution: Inline JavaScript with Maestro's HTTP API

Maestro provides a built-in `http` object for making HTTP requests. Use inline JavaScript instead:

### ✅ Correct Approach

```yaml
- runScript: |
    var testId = 'E2E-GC-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    output.testId = testId;
    output.fixtureKey = 'general-complain-' + testId;

    // Later in the flow...
    var payload = {
      key: output.fixtureKey,
      scenarioName: 'Create General Complain',
      data: { /* your data */ }
    };

    try {
      http.post('http://localhost:5000/api/testfixture', payload);
      console.log('✓ Fixture saved');
    } catch (error) {
      console.log('✗ Failed: ' + error);
    }
```

### Key Points

1. **Use `var` instead of `const`** - Maestro's JS engine may not support ES6 fully
2. **Use string concatenation** instead of template literals in some cases
3. **Use Maestro's `http` object** for HTTP requests, not axios or fetch
4. **Inline all logic** - no external module imports

## Updated Files

All fixture flow files have been updated to use inline JavaScript:

- ✅ `general-complains-with-fixtures.yaml`
- ✅ `lightpost-complains-with-fixtures.yaml`
- ✅ `project-complains-with-fixtures.yaml`

## fixtureManager.js Still Useful!

The `fixtureManager.js` file is still valuable as:

- Documentation of the data structures
- Reference for implementing other integrations
- Backend API contract definition
- Pattern reference for other testing tools

## Testing

Run the tests:

```bash
npm run test:fixtures:general
npm run test:fixtures:lightpost
npm run test:fixtures:project
```

The tests will now work correctly without Node.js module imports.
