import { NextRequest, NextResponse } from "next/server"
import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime"

const bedrockClient = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("[Single Test] Starting single agent test")
    
    // Simple test prompt
    const prompt = `Patient has headache, fever, and fatigue. What's your diagnosis?

Provide your response in JSON format:
{
  "diagnosis": ["Primary condition"],
  "confidence": 0.85,
  "reasoning": "Brief explanation"
}`

    const requestPayload = {
      anthropic_version: "bedrock-2023-05-31",
      max_tokens: 1000,
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      system: "You are a medical AI assistant. Be concise.",
      temperature: 0.5,
    }

    console.log("[Single Test] Invoking Haiku model...")
    const startTime = Date.now()
    
    const command = new InvokeModelCommand({
      modelId: "us.anthropic.claude-3-5-haiku-20241022-v1:0",
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify(requestPayload),
    })

    const response = await bedrockClient.send(command)
    const responseBody = JSON.parse(new TextDecoder().decode(response.body))
    
    const endTime = Date.now()
    console.log("[Single Test] Response received in", endTime - startTime, "ms")
    
    // Extract the response
    const content = responseBody.content[0].text
    
    return NextResponse.json({
      success: true,
      timeMs: endTime - startTime,
      model: "us.anthropic.claude-3-5-haiku-20241022-v1:0",
      rawResponse: content,
      usage: responseBody.usage
    })
    
  } catch (error) {
    console.error("[Single Test] Error:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
