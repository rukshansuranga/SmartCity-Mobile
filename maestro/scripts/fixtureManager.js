/**
 * Centralized Test Fixture Manager for Maestro E2E Tests
 *
 * This module provides reusable functions to save test fixtures to the backend API.
 * Usage in Maestro flows via runScript command.
 */

const axios = require("axios");

/**
 * Configuration for the test fixture API
 */
const FIXTURE_API_CONFIG = {
  baseURL: process.env.FIXTURE_API_URL || "http://localhost:5000",
  endpoint: "/api/testfixture",
  timeout: 10000,
  environment: process.env.TEST_ENV || "local",
};

/**
 * Generate a unique test ID with prefix
 * @param {string} prefix - Prefix for the test ID (default: 'E2E')
 * @returns {string} Unique test ID
 */
function generateTestId(prefix = "E2E") {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Generate a fixture key based on scenario and test ID
 * @param {string} scenario - The scenario name (e.g., 'general-complain')
 * @param {string} testId - The test ID
 * @returns {string} Fixture key
 */
function generateFixtureKey(scenario, testId) {
  return `${scenario}-${testId}`;
}

/**
 * Save test fixture data to the backend API
 * @param {Object} params - Fixture parameters
 * @param {string} params.key - Unique fixture key
 * @param {string} params.scenarioName - Name of the test scenario
 * @param {string} params.scenarioDescription - Description of the scenario
 * @param {Object} params.data - Test fixture data
 * @param {string} params.testRunId - Test run identifier
 * @param {string} params.createdBy - Who created the fixture (default: 'maestro')
 * @returns {Promise<Object>} Response from API
 */
async function saveFixture(params) {
  const {
    key,
    scenarioName,
    scenarioDescription,
    data,
    testRunId,
    createdBy = "maestro",
  } = params;

  if (!key || !scenarioName || !data || !testRunId) {
    throw new Error(
      "Missing required parameters: key, scenarioName, data, and testRunId are required"
    );
  }

  const payload = {
    key,
    scenarioName,
    scenarioDescription: scenarioDescription || scenarioName,
    data,
    createdBy,
    testRunId,
    environment: FIXTURE_API_CONFIG.environment,
    timestamp: new Date().toISOString(),
  };

  try {
    const response = await axios.post(
      `${FIXTURE_API_CONFIG.baseURL}${FIXTURE_API_CONFIG.endpoint}`,
      payload,
      {
        timeout: FIXTURE_API_CONFIG.timeout,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log(`✓ Test fixture saved successfully [ID: ${response.data.id}]`);
    console.log(`  Key: ${key}`);
    console.log(`  Scenario: ${scenarioName}`);

    return {
      success: true,
      fixtureId: response.data.id,
      data: response.data,
    };
  } catch (error) {
    console.error(`✗ Failed to save test fixture [Key: ${key}]`);
    console.error(`  Error: ${error.message}`);

    if (error.response) {
      console.error(`  Status: ${error.response.status}`);
      console.error(`  Response: ${JSON.stringify(error.response.data)}`);
    }

    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Create a general complain test fixture
 * @param {Object} params - Complain parameters
 * @param {string} params.testId - Test run ID
 * @param {string} params.subject - Complain subject
 * @param {string} params.detail - Complain detail/description
 * @param {string} params.complainId - Complain ID from API (optional, can be null initially)
 * @param {Object} params.additionalData - Any additional data to include
 * @returns {Promise<Object>} Save result
 */
async function saveGeneralComplainFixture(params) {
  const {
    testId,
    subject,
    detail,
    complainId = null,
    additionalData = {},
  } = params;

  const key = generateFixtureKey("general-complain", testId);

  return await saveFixture({
    key,
    scenarioName: "Create General Complain",
    scenarioDescription: "Mobile app creates general complain",
    data: {
      complain: {
        subject,
        detail,
        complainType: "GeneralComplain",
        complainId,
      },
      testRunId: testId,
      ...additionalData,
    },
    testRunId: testId,
  });
}

/**
 * Create a light post complain test fixture
 * @param {Object} params - Light post complain parameters
 * @returns {Promise<Object>} Save result
 */
async function saveLightPostComplainFixture(params) {
  const {
    testId,
    subject,
    detail,
    lightPostId,
    complainId = null,
    additionalData = {},
  } = params;

  const key = generateFixtureKey("lightpost-complain", testId);

  return await saveFixture({
    key,
    scenarioName: "Create Light Post Complain",
    scenarioDescription: "Mobile app creates light post complain",
    data: {
      complain: {
        subject,
        detail,
        complainType: "LightPostComplain",
        lightPostId,
        complainId,
      },
      testRunId: testId,
      ...additionalData,
    },
    testRunId: testId,
  });
}

/**
 * Create a project complain test fixture
 * @param {Object} params - Project complain parameters
 * @returns {Promise<Object>} Save result
 */
async function saveProjectComplainFixture(params) {
  const {
    testId,
    subject,
    detail,
    projectId,
    complainId = null,
    additionalData = {},
  } = params;

  const key = generateFixtureKey("project-complain", testId);

  return await saveFixture({
    key,
    scenarioName: "Create Project Complain",
    scenarioDescription: "Mobile app creates project complain",
    data: {
      complain: {
        subject,
        detail,
        complainType: "ProjectComplain",
        projectId,
        complainId,
      },
      testRunId: testId,
      ...additionalData,
    },
    testRunId: testId,
  });
}

/**
 * Update an existing fixture with new data (e.g., adding complainId after API response)
 * @param {string} fixtureKey - The fixture key to update
 * @param {Object} updateData - Data to merge with existing fixture
 * @returns {Promise<Object>} Update result
 */
async function updateFixture(fixtureKey, updateData) {
  try {
    const response = await axios.patch(
      `${FIXTURE_API_CONFIG.baseURL}${FIXTURE_API_CONFIG.endpoint}/${fixtureKey}`,
      updateData,
      {
        timeout: FIXTURE_API_CONFIG.timeout,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log(`✓ Test fixture updated successfully [Key: ${fixtureKey}]`);

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error(`✗ Failed to update test fixture [Key: ${fixtureKey}]`);
    console.error(`  Error: ${error.message}`);

    return {
      success: false,
      error: error.message,
    };
  }
}

// Export all functions
module.exports = {
  generateTestId,
  generateFixtureKey,
  saveFixture,
  saveGeneralComplainFixture,
  saveLightPostComplainFixture,
  saveProjectComplainFixture,
  updateFixture,
  FIXTURE_API_CONFIG,
};
