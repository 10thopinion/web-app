// Test script to verify AWS Bedrock connection
import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";

const client = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

async function testBedrock() {
  console.log("Testing AWS Bedrock connection...");
  console.log("Model setup:", process.env.MODEL_SETUP);
  
  try {
    // Test with Sonnet 4 (dev tier)
    const modelId = "us.anthropic.claude-sonnet-4-20250514-v1:0";
    console.log(`Testing model: ${modelId}`);
    
    const payload = {
      anthropic_version: "bedrock-2023-05-31",
      max_tokens: 100,
      messages: [
        {
          role: "user",
          content: "What model are you and what is your knowledge cutoff date?"
        }
      ],
      system: "You are a helpful AI assistant. Be concise.",
      temperature: 0.5,
    };

    const command = new InvokeModelCommand({
      modelId: modelId,
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify(payload),
    });

    const response = await client.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    
    console.log("\nResponse received!");
    console.log("Content:", responseBody.content[0].text);
    console.log("\nModel usage:");
    console.log("- Input tokens:", responseBody.usage?.input_tokens);
    console.log("- Output tokens:", responseBody.usage?.output_tokens);
    
  } catch (error) {
    console.error("Error:", error.name);
    console.error("Message:", error.message);
    if (error.$metadata) {
      console.error("Request ID:", error.$metadata.requestId);
      console.error("HTTP Status:", error.$metadata.httpStatusCode);
    }
  }
}

testBedrock();
