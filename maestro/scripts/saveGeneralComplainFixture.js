// Save general complain fixture to backend
let fixtureApiUrl = "http://localhost:5000";
let testEnv = "local";

let payload = {
  key: output.fixtureKey,
  scenarioName: "Create General Complain",
  scenarioDescription: "Mobile app creates general complain",
  data: {
    complain: {
      subject: output.complainSubject,
      detail: output.complainDetail,
      complainType: "GeneralComplain",
      complainId: null,
    },
    testRunId: output.testId,
    council: "Mahara",
    user: "amal",
    hasAttachment: true,
    attachmentName: "test-document.pdf",
    createdAt: new Date().toISOString(),
    testType: "e2e-mobile",
  },
  createdBy: "maestro",
  testRunId: output.testId,
  environment: testEnv,
  timestamp: new Date().toISOString(),
};

try {
  http.post(fixtureApiUrl + "/api/testfixture", {
    body: JSON.stringify(payload),
    headers: {
      "Content-Type": "application/json",
    },
  });
  console.log("✓ Test fixture saved successfully");
  console.log("  Key: " + output.fixtureKey);
  console.log("  Scenario: Create General Complain");
} catch (error) {
  console.log("✗ Failed to save test fixture");
  console.log("  Error: " + error);
}
