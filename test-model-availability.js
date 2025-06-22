import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";

const client = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

async function testModelAvailability() {
  const models = [
    { name: "Haiku with US prefix", id: "us.anthropic.claude-3-5-haiku-20241022-v1:0" },
    { name: "Haiku without US prefix", id: "anthropic.claude-3-5-haiku-20241022-v1:0" },
    { name: "Sonnet 4 with US prefix", id: "us.anthropic.claude-sonnet-4-20250514-v1:0" },
    { name: "Sonnet 4 without US prefix", id: "anthropic.claude-sonnet-4-20250514-v1:0" },
    { name: "Opus 4 with US prefix", id: "us.anthropic.claude-opus-4-20250514-v1:0" },
    { name: "Opus 4 without US prefix", id: "anthropic.claude-opus-4-20250514-v1:0" },
  ];

  console.log("Testing Model Availability in AWS Bedrock");
  console.log("Region:", process.env.AWS_REGION || "us-east-1");
  console.log("=========================================\n");

  for (const model of models) {
    console.log(`Testing: ${model.name}`);
    console.log(`Model ID: ${model.id}`);
    
    try {
      const command = new InvokeModelCommand({
        modelId: model.id,
        contentType: "application/json",
        accept: "application/json",
        body: JSON.stringify({
          anthropic_version: "bedrock-2023-05-31",
          max_tokens: 10,
          messages: [{ role: "user", content: "Hi" }],
          temperature: 0.5,
        }),
      });
      
      const response = await client.send(command);
      console.log(`✅ SUCCESS - Model is available and working`);
      
    } catch (error) {
      console.error(`❌ FAILED - ${error.name}: ${error.message}`);
      if (error.name === 'ResourceNotFoundException') {
        console.error(`   → Model not found or not enabled in Bedrock`);
      } else if (error.name === 'AccessDeniedException') {
        console.error(`   → No access to this model`);
      } else if (error.name === 'ValidationException') {
        console.error(`   → Invalid model ID format`);
      }
    }
    console.log();
  }
}

testModelAvailability().catch(console.error);