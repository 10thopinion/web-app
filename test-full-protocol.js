import { runTenthOpinionProtocol } from "./src/services/bedrock.js";

async function testFullProtocol() {
  console.log("Testing Full 10-Agent Protocol");
  console.log("MODEL_SETUP:", process.env.MODEL_SETUP || 'dev');
  console.log("=============================\n");

  const testPatientData = {
    symptoms: ["severe headache", "high fever", "fatigue"],
    description: "Patient has been experiencing severe headaches and high fever for 2 days",
    age: 35,
    biologicalSex: "Female",
    medicalHistory: "No significant past medical history",
    medications: [],
    allergies: []
  };

  try {
    console.log("Starting protocol execution...");
    const startTime = Date.now();
    
    const results = await runTenthOpinionProtocol(testPatientData);
    
    const elapsed = Date.now() - startTime;
    console.log(`\nProtocol completed in ${elapsed}ms`);
    
    // Analyze results
    console.log("\n=== RESULTS ANALYSIS ===");
    const agents = Object.values(results);
    const successfulAgents = agents.filter(a => a.confidence > 0);
    const failedAgents = agents.filter(a => a.confidence === 0);
    
    console.log(`Total agents: ${agents.length}`);
    console.log(`Successful: ${successfulAgents.length}`);
    console.log(`Failed: ${failedAgents.length}`);
    
    console.log("\n=== AGENT DETAILS ===");
    agents.forEach(agent => {
      console.log(`\n${agent.agentName} (${agent.agentId}):`);
      console.log(`  Model: ${agent.model}`);
      console.log(`  Type: ${agent.agentType}`);
      console.log(`  Confidence: ${agent.confidence}`);
      console.log(`  Diagnosis: ${agent.diagnosis[0]}`);
      if (agent.confidence === 0) {
        console.log(`  ❌ FAILED - Reasoning: ${agent.reasoning}`);
      }
    });
    
    // Check for patterns in failures
    console.log("\n=== FAILURE ANALYSIS ===");
    const modelFailures = {};
    failedAgents.forEach(agent => {
      if (!modelFailures[agent.model]) {
        modelFailures[agent.model] = [];
      }
      modelFailures[agent.model].push(agent.agentName);
    });
    
    Object.entries(modelFailures).forEach(([model, agents]) => {
      console.log(`\nModel ${model}:`);
      console.log(`  Failed agents: ${agents.join(', ')}`);
    });
    
  } catch (error) {
    console.error("Protocol execution failed:", error);
  }
}

testFullProtocol().catch(console.error);