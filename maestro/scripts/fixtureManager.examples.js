/**
 * Example: Using Fixture Manager in Maestro Tests
 *
 * This file demonstrates various ways to use the centralized fixture manager
 * in your Maestro test flows.
 */

// ============================================
// Example 1: Basic Usage
// ============================================
const fixtureManager = require("./scripts/fixtureManager.js");

// Generate test ID
const testId = fixtureManager.generateTestId("E2E");
console.log("Test ID:", testId);
// Output: E2E-1699564800000-x8k2p9a1b

// Generate fixture key
const key = fixtureManager.generateFixtureKey("general-complain", testId);
console.log("Fixture Key:", key);
// Output: general-complain-E2E-1699564800000-x8k2p9a1b

// ============================================
// Example 2: Save General Complain Fixture
// ============================================
async function saveGeneralComplainExample() {
  const testId = fixtureManager.generateTestId("E2E-GC");

  const result = await fixtureManager.saveGeneralComplainFixture({
    testId: testId,
    subject: `Road Maintenance Issue ${testId}`,
    detail: "The road near sector 5 has several potholes",
    complainId: null, // Will be updated later
    additionalData: {
      council: "Mahara",
      user: "amal",
      hasAttachment: true,
      attachmentName: "test-document.pdf",
      createdAt: new Date().toISOString(),
    },
  });

  if (result.success) {
    console.log("✓ Fixture saved:", result.fixtureId);
  } else {
    console.log("✗ Failed:", result.error);
  }
}

// ============================================
// Example 3: Save Light Post Complain Fixture
// ============================================
async function saveLightPostComplainExample() {
  const testId = fixtureManager.generateTestId("E2E-LP");

  const result = await fixtureManager.saveLightPostComplainFixture({
    testId: testId,
    subject: `Street Light Issue ${testId}`,
    detail: "Light post is not functioning properly",
    lightPostId: "LP-001",
    complainId: null,
    additionalData: {
      council: "Mahara",
      user: "amal",
      lightPostLocation: "Main Street, Sector 5",
    },
  });

  return result;
}

// ============================================
// Example 4: Save Project Complain Fixture
// ============================================
async function saveProjectComplainExample() {
  const testId = fixtureManager.generateTestId("E2E-PRJ");

  const result = await fixtureManager.saveProjectComplainFixture({
    testId: testId,
    subject: `Project Quality Issue ${testId}`,
    detail: "Construction quality does not meet standards",
    projectId: "PRJ-456",
    complainId: null,
    additionalData: {
      council: "Mahara",
      user: "amal",
      projectName: "Road Construction Project Phase 2",
    },
  });

  return result;
}

// ============================================
// Example 5: Generic Fixture Save
// ============================================
async function saveCustomFixtureExample() {
  const testId = fixtureManager.generateTestId("E2E-CUSTOM");
  const key = fixtureManager.generateFixtureKey("custom-scenario", testId);

  const result = await fixtureManager.saveFixture({
    key: key,
    scenarioName: "Custom Test Scenario",
    scenarioDescription: "This is a custom test scenario",
    data: {
      customField1: "value1",
      customField2: "value2",
      testRunId: testId,
      timestamp: new Date().toISOString(),
    },
    testRunId: testId,
    createdBy: "maestro",
  });

  return result;
}

// ============================================
// Example 6: Update Fixture with Complain ID
// ============================================
async function updateFixtureExample() {
  const testId = fixtureManager.generateTestId("E2E-UPDATE");
  const key = fixtureManager.generateFixtureKey("general-complain", testId);

  // First, create the fixture
  await fixtureManager.saveGeneralComplainFixture({
    testId: testId,
    subject: "Test Subject",
    detail: "Test Detail",
    complainId: null,
  });

  // Later, after getting complainId from API, update the fixture
  const updateResult = await fixtureManager.updateFixture(key, {
    complainId: "CMP-12345",
    status: "submitted",
    submittedAt: new Date().toISOString(),
  });

  return updateResult;
}

// ============================================
// Example 7: Complete Maestro Flow Pattern
// ============================================
/*
In your Maestro YAML file:

---
appId: com.rukshansuranga.smartcity
name: My Test Flow
---

# Step 1: Initialize
- runScript: |
    const fixtureManager = require('./scripts/fixtureManager.js');
    const testId = fixtureManager.generateTestId('E2E-MY');
    output.testId = testId;
    output.fixtureKey = fixtureManager.generateFixtureKey('my-scenario', testId);
    output.subject = `My Subject ${testId}`;
    console.log(`Test ID: ${testId}`);

# Step 2: Perform actions
- launchApp
- tapOn: "Some Button"
- inputText: "${output.subject}"
# ... more actions ...

# Step 3: Save fixture
- runScript: |
    const fixtureManager = require('./scripts/fixtureManager.js');
    
    fixtureManager.saveGeneralComplainFixture({
      testId: output.testId,
      subject: output.subject,
      detail: 'Some detail',
      additionalData: {
        council: 'Mahara',
        user: 'testuser'
      }
    })
    .then(result => {
      if (result.success) {
        console.log(`✓ Saved: ${result.fixtureId}`);
        output.fixtureId = result.fixtureId;
      }
    })
    .catch(error => {
      console.error(`✗ Error: ${error.message}`);
    });

# Step 4: Update if needed
- runScript: |
    const fixtureManager = require('./scripts/fixtureManager.js');
    
    // If you got complainId from somewhere
    if (output.complainId) {
      fixtureManager.updateFixture(output.fixtureKey, {
        complainId: output.complainId
      });
    }
*/

// ============================================
// Example 8: Error Handling
// ============================================
async function errorHandlingExample() {
  const testId = fixtureManager.generateTestId("E2E-ERR");

  try {
    const result = await fixtureManager.saveGeneralComplainFixture({
      testId: testId,
      subject: "Test Subject",
      detail: "Test Detail",
    });

    if (result.success) {
      console.log("✓ Success:", result.fixtureId);
      // Continue test...
    } else {
      console.log("✗ Failed:", result.error);
      // Test continues anyway - fixture save is optional
    }
  } catch (error) {
    console.error("Exception:", error.message);
    // Test continues anyway
  }
}

// ============================================
// Example 9: Multiple Fixtures in One Test
// ============================================
async function multipleFituresExample() {
  const testRunId = fixtureManager.generateTestId("E2E-MULTI");

  // Save fixture for first action
  const fixture1 = await fixtureManager.saveGeneralComplainFixture({
    testId: `${testRunId}-1`,
    subject: "First Complain",
    detail: "First detail",
  });

  // Save fixture for second action
  const fixture2 = await fixtureManager.saveGeneralComplainFixture({
    testId: `${testRunId}-2`,
    subject: "Second Complain",
    detail: "Second detail",
  });

  // Both fixtures share the same test run ID but have unique test IDs
  console.log("Saved fixtures:", fixture1.fixtureId, fixture2.fixtureId);
}

// ============================================
// Example 10: Environment-Specific Configuration
// ============================================
async function environmentConfigExample() {
  // Set environment before running tests
  process.env.FIXTURE_API_URL = "http://staging-api.example.com";
  process.env.TEST_ENV = "staging";

  const testId = fixtureManager.generateTestId("E2E-ENV");

  const result = await fixtureManager.saveGeneralComplainFixture({
    testId: testId,
    subject: "Test in Staging",
    detail: "This will be saved to staging environment",
  });

  // Fixture will be saved to staging API with environment: 'staging'
  return result;
}

// Export examples for reference
module.exports = {
  saveGeneralComplainExample,
  saveLightPostComplainExample,
  saveProjectComplainExample,
  saveCustomFixtureExample,
  updateFixtureExample,
  errorHandlingExample,
  multipleFituresExample,
  environmentConfigExample,
};
