// Test script for real AWS Bedrock integration
async function testAnalysis() {
  const patientData = {
    symptoms: ["Headache", "Fever", "Fatigue"],
    description: "Patient has been experiencing severe headaches for the past 3 days, accompanied by a fever of 101°F and general fatigue.",
    age: 35,
    biologicalSex: "female",
    medicalHistory: "No significant medical history",
    medications: [],
    allergies: ["Penicillin"]
  };

  try {
    console.log("Testing real AWS Bedrock integration...");
    console.log("Using MODEL_SETUP=dev (Sonnet 4 for all agents)");
    console.log("Patient data:", JSON.stringify(patientData, null, 2));
    console.log("\nSending request to /api/analyze...");
    
    const response = await fetch('http://localhost:3000/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(patientData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    console.log("\n✅ SUCCESS - Response received:");
    console.log("Session ID:", data.sessionId);
    console.log("Processing time:", data.processingTime, "ms");
    console.log("\nAgent Results:");
    
    Object.entries(data.results).forEach(([agentId, result]) => {
      console.log(`\n${result.agentName} (${agentId}):`);
      console.log("- Model:", result.model);
      console.log("- Diagnosis:", result.diagnosis.join(", "));
      console.log("- Confidence:", (result.confidence * 100).toFixed(0) + "%");
      console.log("- Red Flags:", result.redFlags?.join(", ") || "None");
    });
    
    if (data.summary) {
      console.log("\n📋 PROTOCOL SUMMARY:");
      console.log("Primary Diagnosis:", data.summary.primaryDiagnosis.condition);
      console.log("ICD-10 Code:", data.summary.primaryDiagnosis.icd10Code);
      console.log("Confidence:", (data.summary.primaryDiagnosis.confidence * 100).toFixed(0) + "%");
      console.log("Urgency Level:", data.summary.urgencyLevel);
      console.log("Consensus Score:", (data.summary.consensus * 100).toFixed(0) + "%");
    }

    // Cost estimation
    const estimatedCost = 10 * 0.003 * 2; // 10 agents * ~$0.003 per call * 2 (input+output)
    console.log(`\n💰 Estimated cost for this analysis: $${estimatedCost.toFixed(3)}`);
    
  } catch (error) {
    console.error("\n❌ ERROR:", error.message);
    
    if (error.message.includes("fetch")) {
      console.error("Make sure the Next.js dev server is running on port 3000");
    }
  }
}

// Add a timeout to prevent hanging forever
const timeoutId = setTimeout(() => {
  console.error("\n❌ TIMEOUT: Analysis took more than 60 seconds");
  console.error("This is expected - running 10 AI agents sequentially takes time.");
  console.error("Try testing with MODEL_SETUP=minimal for faster (cheaper) results.");
  process.exit(1);
}, 60000);

testAnalysis().then(() => {
  clearTimeout(timeoutId);
  process.exit(0);
}).catch(err => {
  clearTimeout(timeoutId);
  console.error("\n❌ Unhandled error:", err);
  process.exit(1);
});
