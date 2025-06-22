import { NextRequest, NextResponse } from "next/server"
import { runTenthOpinionProtocol } from "@/services/bedrock"
// import { saveSession, updateSessionStatus } from "@/services/dynamodb"
import { checkExpertTrigger } from "@/services/expert-injection"
// import { collectLearningMetrics } from "@/services/continuous-learning"
import { getPresignedUploadUrl } from "@/services/s3-upload"
import { PatientData, AgentOpinion } from "@/types/medical"
import { TenthOpinionProtocol, ProtocolSummary } from "@/types/protocol"

export async function POST(request: NextRequest) {
  console.log("[API] Analysis request received at", new Date().toISOString())
  try {
    const patientData: PatientData = await request.json()
    console.log("[API] Patient data:", JSON.stringify(patientData).substring(0, 200))
    
    // Initialize protocol
    const protocol: TenthOpinionProtocol = {
      sessionId: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      patientData,
      agents: {
        blindAgents: [],
        informedAgents: [],
        scrutinizers: [],
      },
      startTime: new Date(),
      status: "initializing",
    }

    // Save initial session
    try {
      console.log("[API] Attempting to save session to DynamoDB...")
      // await saveSession(protocol) // TEMPORARILY DISABLED FOR DEBUGGING
      console.log("[API] DynamoDB save skipped (temporarily disabled)")
    } catch (dbError) {
      console.error("Failed to save session:", dbError)
      // Continue without saving - don't fail the analysis
    }

    // Update status to collecting
    protocol.status = "collecting"
    
    // Run the protocol
    console.log("[API] Starting Tenth Opinion Protocol...")
    const results = await runTenthOpinionProtocol(patientData)
    console.log("[API] Protocol completed, got", Object.keys(results).length, "agent results")
    
    // Process results
    const blindAgents = ['agent-1', 'agent-2', 'agent-3', 'agent-4']
      .map(id => results[id])
      .filter(Boolean)
    
    const informedAgents = ['agent-5', 'agent-6', 'agent-7']
      .map(id => results[id])
      .filter(Boolean)
    
    const scrutinizers = ['agent-8', 'agent-9']
      .map(id => results[id])
      .filter(Boolean)
    
    const finalAuthority = results['agent-10']

    // Check for expert trigger
    const allOpinions = [...blindAgents, ...informedAgents, ...scrutinizers, finalAuthority]
    const expertTrigger = checkExpertTrigger(allOpinions)

    // Generate summary
    const summary = generateProtocolSummary(
      blindAgents,
      informedAgents,
      scrutinizers,
      finalAuthority
    )

    // Update protocol
    protocol.agents = {
      blindAgents,
      informedAgents,
      scrutinizers,
      finalAuthority,
    }
    protocol.summary = summary
    protocol.expertTrigger = expertTrigger || undefined
    protocol.endTime = new Date()
    protocol.status = "complete"

    // Save final results
    try {
      console.log("[API] Skipping DynamoDB update and learning metrics (temporarily disabled)")
      /*
      await updateSessionStatus(protocol.sessionId, "complete", {
        endTime: protocol.endTime,
        summary: protocol.summary,
        expertTrigger: protocol.expertTrigger,
      })

      // Collect learning metrics
      await collectLearningMetrics(
        protocol.sessionId,
        results,
        summary,
        protocol.startTime,
        protocol.endTime
      )
      */
    } catch (dbError) {
      console.error("Failed to update session:", dbError)
    }

    return NextResponse.json({
      success: true,
      sessionId: protocol.sessionId,
      results,
      summary,
      expertTrigger,
      processingTime: protocol.endTime.getTime() - protocol.startTime.getTime(),
    })

  } catch (error) {
    console.error("[API] Analysis error:", error)
    console.error("[API] Error stack:", error instanceof Error ? error.stack : "No stack trace")
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Analysis failed",
      },
      { status: 500 }
    )
  }
}

// Endpoint for getting presigned URLs for image uploads
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const fileName = searchParams.get("fileName")
    const contentType = searchParams.get("contentType")
    const sessionId = searchParams.get("sessionId")

    if (!fileName || !contentType || !sessionId) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      )
    }

    const { uploadUrl, key } = await getPresignedUploadUrl(
      fileName,
      contentType,
      sessionId
    )

    return NextResponse.json({
      uploadUrl,
      key,
      expiresIn: 300, // 5 minutes
    })
  } catch (error) {
    console.error("Presigned URL error:", error)
    return NextResponse.json(
      { error: "Failed to generate upload URL" },
      { status: 500 }
    )
  }
}

function generateProtocolSummary(
  blindAgents: AgentOpinion[],
  informedAgents: AgentOpinion[],
  scrutinizers: AgentOpinion[],
  finalAuthority: AgentOpinion
): ProtocolSummary {
  // Count diagnosis frequencies
  const diagnosisCounts = new Map<string, number>()
  const allDiagnoses = [...blindAgents, ...informedAgents].flatMap((a) => a.diagnosis)
  
  allDiagnoses.forEach((diag) => {
    diagnosisCounts.set(diag, (diagnosisCounts.get(diag) || 0) + 1)
  })

  // Sort by frequency
  const sortedDiagnoses = Array.from(diagnosisCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([diagnosis]) => diagnosis)

  // Extract all red flags
  const allRedFlags = [...new Set(
    [...blindAgents, ...informedAgents, ...scrutinizers, finalAuthority]
      .flatMap((a) => a.redFlags || [])
  )]

  // Determine urgency
  const urgencyLevel = determineUrgencyLevel(allRedFlags, finalAuthority.confidence)

  // Calculate consensus
  const consensus = calculateConsensusScore(
    blindAgents,
    informedAgents,
    finalAuthority
  )

  return {
    primaryDiagnosis: {
      condition: finalAuthority.diagnosis[0] || sortedDiagnoses[0] || "Requires further evaluation",
      confidence: finalAuthority.confidence,
      icd10Code: getICD10Code(finalAuthority.diagnosis[0]),
    },
    alternativeDiagnoses: sortedDiagnoses.slice(1, 4).map((condition) => ({
      condition,
      confidence: calculateDiagnosisConfidence(condition, allDiagnoses),
      icd10Code: getICD10Code(condition),
    })),
    urgencyLevel,
    redFlags: allRedFlags,
    recommendedActions: finalAuthority.recommendations || [],
    consensus,
  }
}

function determineUrgencyLevel(
  redFlags: string[],
  confidence: number
): "immediate" | "urgent" | "moderate" | "low" {
  const urgentKeywords = [
    "immediate",
    "emergency",
    "severe",
    "chest pain",
    "difficulty breathing",
    "loss of consciousness",
  ]

  const hasUrgentFlags = redFlags.some((flag) =>
    urgentKeywords.some((keyword) => flag.toLowerCase().includes(keyword))
  )

  if (hasUrgentFlags) return "immediate"
  if (redFlags.length > 3 || confidence < 0.5) return "urgent"
  if (redFlags.length > 0) return "moderate"
  return "low"
}

function calculateConsensusScore(
  blindAgents: AgentOpinion[],
  informedAgents: AgentOpinion[],
  finalAuthority: AgentOpinion
): number {
  const primaryDiagnosis = finalAuthority.diagnosis[0]
  if (!primaryDiagnosis) return 0

  const allAgents = [...blindAgents, ...informedAgents]
  const agreeingAgents = allAgents.filter((agent) =>
    agent.diagnosis.some((d: string) => 
      d.toLowerCase() === primaryDiagnosis.toLowerCase()
    )
  )

  return agreeingAgents.length / allAgents.length
}

function calculateDiagnosisConfidence(
  diagnosis: string,
  allDiagnoses: string[]
): number {
  const count = allDiagnoses.filter(
    (d) => d.toLowerCase() === diagnosis.toLowerCase()
  ).length
  return Math.min(0.95, 0.5 + (count * 0.1))
}

function getICD10Code(condition: string): string {
  const icdMap: Record<string, string> = {
    "Viral upper respiratory infection": "J06.9",
    "Common cold": "J00",
    "Influenza": "J11.1",
    "Tension headache": "G44.2",
    "Sinusitis": "J32.9",
    "Bronchitis": "J20.9",
    "Viral pneumonia": "J12.9",
    "Asthma exacerbation": "J45.901",
    "GERD": "K21.9",
    "Hypertension": "I10",
    "Type 2 diabetes": "E11.9",
    "Anxiety disorder": "F41.9",
    "Depression": "F32.9",
    "Migraine": "G43.909",
    "Osteoarthritis": "M19.90",
  }
  
  // Try exact match first
  if (icdMap[condition]) return icdMap[condition]
  
  // Try partial match
  const lowerCondition = condition.toLowerCase()
  for (const [key, code] of Object.entries(icdMap)) {
    if (lowerCondition.includes(key.toLowerCase()) || 
        key.toLowerCase().includes(lowerCondition)) {
      return code
    }
  }
  
  return "R69" // Unspecified illness
}
