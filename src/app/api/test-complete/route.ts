import { NextRequest, NextResponse } from "next/server"
import { runTenthOpinionProtocol } from "@/services/bedrock"
import { saveSession } from "@/services/dynamodb"
import { PatientData } from "@/types/medical"

// Test endpoint for complete protocol with timing breakdown
export async function POST(request: NextRequest) {
  try {
    const body: PatientData = await request.json()
    console.log("[Complete Test] Starting protocol test with:", JSON.stringify(body).substring(0, 100))
    
    const startTime = Date.now()
    
    // Run the complete protocol
    const results = await runTenthOpinionProtocol(body)
    
    const totalTime = Date.now() - startTime
    console.log("[Complete Test] Protocol completed in", totalTime, "ms")
    
    // Count successful vs failed agents
    const agentStatuses = Object.values(results).map(agent => ({
      id: agent.agentId,
      name: agent.agentName,
      success: agent.diagnosis[0] !== "Error in analysis",
      confidence: agent.confidence,
      diagnosis: agent.diagnosis[0]
    }))
    
    const successCount = agentStatuses.filter(a => a.success).length
    const failureCount = agentStatuses.filter(a => !a.success).length
    
    // Create a summary
    const summary = {
      primaryDiagnosis: results['agent-10']?.diagnosis[0] || "No consensus",
      confidence: results['agent-10']?.confidence || 0,
      urgencyLevel: (results['agent-10']?.redFlags?.length ?? 0) > 0 ? 'urgent' : 'moderate'
    }
    
    return NextResponse.json({
      success: true,
      summary,
      metrics: {
        totalTimeMs: totalTime,
        totalAgents: 10,
        successfulAgents: successCount,
        failedAgents: failureCount,
        avgTimePerAgent: Math.round(totalTime / 10)
      },
      agentStatuses,
      modelTier: process.env.MODEL_SETUP
    })
    
  } catch (error) {
    console.error("[Complete Test] Error:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
