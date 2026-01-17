// Initialize general complain test
const now = new Date();
const timestamp =
  String(now.getDate()).padStart(2, "0") +
  "-" +
  String(now.getMonth() + 1).padStart(2, "0") +
  "-" +
  now.getFullYear() +
  "-" +
  String(now.getHours()).padStart(2, "0") +
  "-" +
  String(now.getMinutes()).padStart(2, "0");
let testId = "E2E-GC-" + timestamp;
output.testId = testId;
output.fixtureKey = "general-complain-" + testId;
output.complainSubject = "Road Maintenance Issue " + testId;
output.complainDetail =
  "The road near sector 5 has several potholes that need immediate attention. Test ID: " +
  testId +
  ", Timestamp: " +
  new Date().toISOString();
console.log("Test initialized: " + testId);
console.log("Fixture key: " + output.fixtureKey);
