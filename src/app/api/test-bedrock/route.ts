import { NextRequest, NextResponse } from "next/server"
import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime"

export async function GET(request: NextRequest) {
  console.log("[Test Bedrock] Starting test...")
  
  try {
    const client = new BedrockRuntimeClient({
      region: process.env.AWS_REGION || "us-east-1",
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    })
    
    console.log("[Test Bedrock] Client initialized")
    
    const requestPayload = {
      anthropic_version: "bedrock-2023-05-31",
      max_tokens: 100,
      messages: [
        {
          role: "user",
          content: "Hello, please respond with a simple greeting."
        }
      ],
      system: "You are a helpful assistant. Keep your response brief.",
      temperature: 0.5,
    }
    
    const command = new InvokeModelCommand({
      modelId: "us.anthropic.claude-sonnet-4-20250514-v1:0",
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify(requestPayload),
    })
    
    console.log("[Test Bedrock] Sending command...")
    const startTime = Date.now()
    
    const response = await client.send(command)
    const responseBody = JSON.parse(new TextDecoder().decode(response.body))
    
    const endTime = Date.now()
    console.log("[Test Bedrock] Response received in", endTime - startTime, "ms")
    
    return NextResponse.json({
      success: true,
      timeMs: endTime - startTime,
      response: responseBody.content[0].text,
      usage: responseBody.usage
    })
    
  } catch (error) {
    console.error("[Test Bedrock] Error:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      errorType: error instanceof Error ? error.constructor.name : "UnknownError"
    }, { status: 500 })
  }
}
