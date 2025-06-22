// Test script for minimal Bedrock integration
console.log("Testing with MODEL_SETUP=minimal (Haiku only)");
console.log("This should be the cheapest and fastest option\n");

async function testMinimal() {
  const patientData = {
    symptoms: ["headache"],
    description: "mild headache for 2 hours",
    age: 30,
    biologicalSex: "male",
    medicalHistory: "None",
    medications: [],
    allergies: []
  };

  try {
    console.log("Patient data:", JSON.stringify(patientData, null, 2));
    console.log("\nSending request to /api/analyze...");
    
    const response = await fetch('http://localhost:3000/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(patientData),
    });

    const text = await response.text();
    console.log("\nRaw response:", text);
    
    if (!response.ok) {
      console.error(`HTTP error! status: ${response.status}`);
      return;
    }

    try {
      const data = JSON.parse(text);
      console.log("\n✅ SUCCESS!");
      console.log("Session ID:", data.sessionId);
      console.log("Processing time:", data.processingTime, "ms");
      
      if (data.summary) {
        console.log("\nPrimary Diagnosis:", data.summary.primaryDiagnosis.condition);
        console.log("Confidence:", (data.summary.primaryDiagnosis.confidence * 100).toFixed(0) + "%");
      }
    } catch (parseError) {
      console.error("Failed to parse JSON:", parseError.message);
    }
    
  } catch (error) {
    console.error("\n❌ ERROR:", error.message);
    if (error.message.includes("fetch")) {
      console.error("Make sure the Next.js dev server is running on port 3000");
    }
  }
}

// Quick timeout
const timeoutId = setTimeout(() => {
  console.error("\n❌ TIMEOUT: Analysis took more than 30 seconds");
  process.exit(1);
}, 30000);

testMinimal().then(() => {
  clearTimeout(timeoutId);
  process.exit(0);
}).catch(err => {
  clearTimeout(timeoutId);
  console.error("\n❌ Unhandled error:", err);
  process.exit(1);
});
