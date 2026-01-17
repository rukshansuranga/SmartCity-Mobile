// Fetch oldest general complain fixture for reply comment testing
let fixtureApiUrl = "http://localhost:5000";

try {
  const fixtureResponse = http.get(
    fixtureApiUrl +
      "/api/testfixture/oldest?scenarioName=Create General Complain"
  );

  const apiResponse = JSON.parse(fixtureResponse.body);
  console.log("✓ Fetched API response successfully");

  // Parse the nested data field which is a JSON string
  const complainData = JSON.parse(apiResponse.data.data);
  console.log("  Parsed complain data");

  // Extract complain subject for searching
  output.complainSubject = complainData.complain.subject;
  output.fixtureId = apiResponse.data.id;
  output.testRunId = complainData.testRunId;

  console.log("  Complain subject: " + output.complainSubject);
  console.log("  Fixture ID: " + output.fixtureId);
  console.log("  Test Run ID: " + output.testRunId);
} catch (error) {
  console.log("✗ Failed to fetch test fixture");
  console.log("  Error: " + error);
  throw error;
}
