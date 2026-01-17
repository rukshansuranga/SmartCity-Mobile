// Initialize tax payment test and reset arrears status
// TODO: Update this with your active ngrok URL
const baseUrl = "https://ebd216584911.ngrok-free.app/api/";

// Generate test ID
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

const testId = "E2E-TAX-" + timestamp;
output.testId = testId;

console.log("=== Tax Payment Test Initialization ===");
console.log("Test ID: " + testId);
console.log("Timestamp: " + new Date().toISOString());

// Reset arrears status for LP002-U01
// Note: You'll need to get the actual ArrearsID from your database
// This is a placeholder - replace with actual arrears IDs
const arrearsIds = [7, 9, 11]; // Replace with actual arrears IDs for LP002-U01

console.log("\n=== Resetting Arrears Recovery Status ===");
console.log("Arrears IDs to reset: " + JSON.stringify(arrearsIds));
console.log("Endpoint: " + baseUrl + "testfixture/reset-arrears-status");

try {
  const response = http.post(baseUrl + "testfixture/reset-arrears-status", {
    body: JSON.stringify({
      ArrearsIds: arrearsIds,
    }),
    headers: {
      "Content-Type": "application/json",
    },
  });

  console.log("✓ HTTP Response Status: " + response.code);
  console.log("✓ HTTP Response Body: " + JSON.stringify(response.body));

  if (response.code >= 200 && response.code < 300) {
    console.log("✓ Reset arrears status successful");
    output.resetSuccess = true;
  } else {
    console.log("✗ Reset arrears status failed with status: " + response.code);
    output.resetSuccess = false;
  }
} catch (error) {
  console.log("✗ Error resetting arrears status: " + error);
  console.log("✗ Error details: " + JSON.stringify(error));
  output.resetSuccess = false;
}

console.log("\n=== Initialization Complete ===");
