import { NextRequest, NextResponse } from "next/server"
import { invokeAgent } from "@/services/bedrock"
import { getAgentConfigs, ModelTier } from "@/types/protocol"
import { PatientData } from "@/types/medical"

export async function POST(request: NextRequest) {
  try {
    const body: PatientData = await request.json()
    console.log("[Two Agent Test] Starting with patient data:", JSON.stringify(body).substring(0, 100))
    
    const modelTier = (process.env.MODEL_SETUP as ModelTier) || 'dev'
    const AGENT_CONFIGS = getAgentConfigs(modelTier)
    
    console.log("[Two Agent Test] Using model tier:", modelTier)
    console.log("[Two Agent Test] First agent model:", AGENT_CONFIGS.blind[0].model)
    
    const startTime = Date.now()
    
    // Run just first two blind agents
    console.log("[Two Agent Test] Running agent 1...")
    const agent1Result = await invokeAgent(AGENT_CONFIGS.blind[0], body)
    
    console.log("[Two Agent Test] Agent 1 complete in", Date.now() - startTime, "ms")
    console.log("[Two Agent Test] Running agent 2...")
    
    const agent2Result = await invokeAgent(AGENT_CONFIGS.blind[1], body)
    
    const totalTime = Date.now() - startTime
    console.log("[Two Agent Test] Both agents complete in", totalTime, "ms")
    
    return NextResponse.json({
      success: true,
      timeMs: totalTime,
      results: {
        agent1: agent1Result,
        agent2: agent2Result
      },
      modelTier
    })
    
  } catch (error) {
    console.error("[Two Agent Test] Error:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
