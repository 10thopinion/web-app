async function testAPIEndpoint() {
  console.log("Testing /api/analyze endpoint");
  console.log("=============================\n");

  const testData = {
    symptoms: ["severe headache", "high fever", "fatigue"],
    description: "Patient has been experiencing severe headaches and high fever for 2 days",
    age: 35,
    biologicalSex: "Female",
    medicalHistory: "No significant past medical history",
    medications: [],
    allergies: []
  };

  try {
    console.log("Sending request to http://localhost:3000/api/analyze");
    
    const response = await fetch('http://localhost:3000/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    const result = await response.json();
    
    if (!response.ok) {
      console.error("API Error:", result);
      return;
    }

    console.log("Response received!");
    console.log("Success:", result.success);
    console.log("Processing time:", result.processingTime, "ms");
    
    // Analyze agent results
    if (result.results) {
      const agents = Object.values(result.results);
      const successful = agents.filter(a => a.confidence > 0);
      const failed = agents.filter(a => a.confidence === 0);
      
      console.log("\n=== AGENT RESULTS ===");
      console.log("Total agents:", agents.length);
      console.log("Successful:", successful.length);
      console.log("Failed:", failed.length);
      
      if (failed.length > 0) {
        console.log("\n=== FAILED AGENTS ===");
        failed.forEach(agent => {
          console.log(`${agent.agentName}: ${agent.reasoning}`);
        });
      }
    }
    
    console.log("\n=== SUMMARY ===");
    if (result.summary) {
      console.log("Primary diagnosis:", result.summary.primaryDiagnosis.condition);
      console.log("Confidence:", result.summary.primaryDiagnosis.confidence);
      console.log("Urgency:", result.summary.urgencyLevel);
      console.log("Consensus:", result.summary.consensus);
    }
    
  } catch (error) {
    console.error("Request failed:", error.message);
    console.log("\nMake sure the dev server is running with: bun dev");
  }
}

testAPIEndpoint();