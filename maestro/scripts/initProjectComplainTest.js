// Initialize project complain test
let testId =
  "E2E-PRJ-" + Date.now() + "-" + Math.random().toString(36).substr(2, 9);
output.testId = testId;
output.fixtureKey = "project-complain-" + testId;
output.complainSubject = "Project Issue " + testId;
output.complainDetail =
  "Construction project has quality issues. Test ID: " +
  testId +
  ", Timestamp: " +
  new Date().toISOString();
output.projectId = "PRJ-TEST-001";
console.log("Test initialized: " + testId);
console.log("Fixture key: " + output.fixtureKey);
