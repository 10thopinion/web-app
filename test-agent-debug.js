import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";

const client = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

async function testSingleAgent(name, delay = 0) {
  if (delay > 0) {
    console.log(`Waiting ${delay}ms before invoking ${name}...`);
    await new Promise(resolve => setTimeout(resolve, delay));
  }
  
  console.log(`\nTesting ${name}...`);
  try {
    const startTime = Date.now();
    
    const command = new InvokeModelCommand({
      modelId: "us.anthropic.claude-3-5-haiku-20241022-v1:0",
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify({
        anthropic_version: "bedrock-2023-05-31",
        max_tokens: 500,
        messages: [{ 
          role: "user", 
          content: "Patient has headache and fever. Provide analysis in JSON format: {\"diagnosis\": [\"condition\"], \"confidence\": 0.8, \"reasoning\": \"explanation\"}" 
        }],
        system: "You are a medical AI. Provide a brief diagnosis.",
        temperature: 0.5,
      }),
    });
    
    const response = await client.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    const elapsed = Date.now() - startTime;
    
    console.log(`✅ ${name} SUCCESS in ${elapsed}ms`);
    console.log(`   Usage:`, responseBody.usage);
    console.log(`   Response:`, responseBody.content?.[0]?.text?.substring(0, 100) + '...');
    
    return { success: true, elapsed, usage: responseBody.usage };
  } catch (error) {
    console.error(`❌ ${name} FAILED:`, error.name);
    console.error(`   Message:`, error.message);
    if (error.$metadata) {
      console.error(`   Request ID:`, error.$metadata.requestId);
      console.error(`   HTTP Status:`, error.$metadata.httpStatusCode);
    }
    return { success: false, error: error.name, message: error.message };
  }
}

async function testConcurrentAgents() {
  console.log("=== Testing Concurrent Execution (like Phase 1) ===");
  const promises = [
    testSingleAgent("Agent-1"),
    testSingleAgent("Agent-2"),
    testSingleAgent("Agent-3"),
    testSingleAgent("Agent-4"),
  ];
  
  const results = await Promise.all(promises);
  const successCount = results.filter(r => r.success).length;
  console.log(`\nConcurrent Results: ${successCount}/4 succeeded`);
  
  return successCount < 4; // Return true if we need rate limiting
}

async function testSequentialAgents() {
  console.log("\n=== Testing Sequential Execution with Delays ===");
  const delays = [0, 1000, 2000, 3000]; // Increasing delays
  const results = [];
  
  for (let i = 0; i < 4; i++) {
    const result = await testSingleAgent(`Agent-${i+1}`, delays[i]);
    results.push(result);
  }
  
  const successCount = results.filter(r => r.success).length;
  console.log(`\nSequential Results: ${successCount}/4 succeeded`);
  
  // Find optimal delay
  if (successCount === 4) {
    const firstFailIndex = results.findIndex(r => !r.success);
    if (firstFailIndex === -1) {
      console.log("✅ No delay needed!");
    } else {
      console.log(`✅ Optimal delay appears to be: ${delays[firstFailIndex]}ms`);
    }
  }
}

async function main() {
  console.log("AWS Bedrock Agent Debug Test");
  console.log("Region:", process.env.AWS_REGION || "us-east-1");
  console.log("Model: us.anthropic.claude-3-5-haiku-20241022-v1:0");
  console.log("========================================\n");
  
  // Test single agent first
  await testSingleAgent("Single-Test");
  
  // Test concurrent execution
  const needsRateLimit = await testConcurrentAgents();
  
  if (needsRateLimit) {
    // Test with delays
    await testSequentialAgents();
  }
}

main().catch(console.error);