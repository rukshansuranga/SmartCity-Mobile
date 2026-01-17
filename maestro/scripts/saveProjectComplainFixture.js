// Save project complain fixture to backend
let fixtureApiUrl = "http://localhost:5000";
let testEnv = "local";

let payload = {
  key: output.fixtureKey,
  scenarioName: "Create Project Complain",
  scenarioDescription: "Mobile app creates project complain",
  data: {
    complain: {
      subject: output.complainSubject,
      detail: output.complainDetail,
      complainType: "ProjectComplain",
      projectId: output.projectId,
      complainId: null,
    },
    testRunId: output.testId,
    council: "Mahara",
    user: "amal",
    createdAt: new Date().toISOString(),
    testType: "e2e-mobile",
    hasAttachment: false,
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
  console.log("✓ Project fixture saved successfully");
  console.log("  Key: " + output.fixtureKey);
} catch (error) {
  console.log("✗ Failed to save test fixture");
  console.log("  Error: " + error);
}
