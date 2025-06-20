import { AgentOpinion } from "@/types/medical"
import { ProtocolSummary } from "@/types/protocol"
import { saveAnalyticsData } from "./dynamodb"

export interface LearningMetrics {
  sessionId: string
  timestamp: Date
  agentPerformance: AgentPerformanceMetrics[]
  diagnosticAccuracy?: DiagnosticAccuracy
  patientOutcome?: PatientOutcome
  processingMetrics: ProcessingMetrics
}

export interface AgentPerformanceMetrics {
  agentId: string
  agentName: string
  confidence: number
  agreementWithConsensus: number
  processingTimeMs: number
  tokenUsage?: {
    input: number
    output: number
  }
}

export interface DiagnosticAccuracy {
  primaryDiagnosisCorrect?: boolean
  differentialContainsCorrect?: boolean
  expertAgreement?: boolean
  patientFeedbackScore?: number // 1-5 scale
}

export interface PatientOutcome {
  followUpConfirmed?: boolean
  treatmentEffective?: boolean
  readmissionWithin30Days?: boolean
  finalDiagnosis?: string
}

export interface ProcessingMetrics {
  totalTimeMs: number
  parallelPhaseTimeMs: number
  sequentialPhaseTimeMs: number
  tokenUsageTotal: number
  estimatedCost: number
}

/**
 * Collect and analyze performance metrics from a protocol run
 */
export async function collectLearningMetrics(
  sessionId: string,
  opinions: Record<string, AgentOpinion>,
  summary: ProtocolSummary,
  startTime: Date,
  endTime: Date
): Promise<LearningMetrics> {
  const opinionArray = Object.values(opinions)
  
  // Calculate consensus diagnosis
  const consensusDiagnosis = summary.primaryDiagnosis.condition
  
  // Calculate agent performance metrics
  const agentPerformance: AgentPerformanceMetrics[] = opinionArray.map((opinion) => {
    const agreementScore = calculateAgreementScore(opinion, consensusDiagnosis)
    
    return {
      agentId: opinion.agentId,
      agentName: opinion.agentName,
      confidence: opinion.confidence,
      agreementWithConsensus: agreementScore,
      processingTimeMs: 0, // Would be tracked in real implementation
    }
  })

  // Calculate processing metrics
  const processingMetrics: ProcessingMetrics = {
    totalTimeMs: endTime.getTime() - startTime.getTime(),
    parallelPhaseTimeMs: 0, // Would be tracked
    sequentialPhaseTimeMs: 0, // Would be tracked
    tokenUsageTotal: estimateTokenUsage(opinions),
    estimatedCost: estimateCost(opinions),
  }

  const metrics: LearningMetrics = {
    sessionId,
    timestamp: new Date(),
    agentPerformance,
    processingMetrics,
  }

  // Save anonymous analytics
  await saveAnalyticsData({
    diagnosisType: summary.primaryDiagnosis.condition,
    confidence: summary.primaryDiagnosis.confidence,
    consensusScore: summary.consensus,
    urgencyLevel: summary.urgencyLevel,
    expertTriggered: false, // Would check actual trigger
    completionTimeMs: processingMetrics.totalTimeMs,
  })

  return metrics
}

/**
 * Calculate how well an agent agrees with the consensus
 */
function calculateAgreementScore(
  opinion: AgentOpinion,
  consensusDiagnosis: string
): number {
  // Check if agent's primary diagnosis matches consensus
  if (opinion.diagnosis[0]?.toLowerCase() === consensusDiagnosis.toLowerCase()) {
    return 1.0
  }
  
  // Check if consensus is in agent's differential
  const inDifferential = opinion.diagnosis.some(
    (d) => d.toLowerCase() === consensusDiagnosis.toLowerCase()
  )
  
  if (inDifferential) {
    return 0.5
  }
  
  return 0.0
}

/**
 * Estimate token usage for cost tracking
 */
function estimateTokenUsage(opinions: Record<string, AgentOpinion>): number {
  // Rough estimation: 
  // - System prompt: ~500 tokens
  // - User prompt: ~200 tokens
  // - Response: ~300 tokens
  const tokensPerAgent = 1000
  return Object.keys(opinions).length * tokensPerAgent
}

/**
 * Estimate cost based on model usage
 */
function estimateCost(opinions: Record<string, AgentOpinion>): number {
  const costs: Record<string, { input: number; output: number }> = {
    "anthropic.claude-opus-4-20250514-v1:0": { input: 0.015, output: 0.075 },
    "anthropic.claude-sonnet-4-20250514-v1:0": { input: 0.003, output: 0.015 },
    "anthropic.claude-3-5-haiku-20240307": { input: 0.001, output: 0.005 },
  }

  let totalCost = 0
  
  Object.values(opinions).forEach((opinion) => {
    const modelCost = costs[opinion.model] || costs["anthropic.claude-sonnet-4-20250514-v1:0"]
    // Estimate 500 input tokens, 300 output tokens per agent
    const inputCost = (500 / 1000) * modelCost.input
    const outputCost = (300 / 1000) * modelCost.output
    totalCost += inputCost + outputCost
  })

  return totalCost
}

/**
 * Analyze patterns in diagnostic performance over time
 */
export interface PerformanceTrends {
  averageConfidence: number
  consensusRate: number
  expertTriggerRate: number
  averageCompletionTime: number
  costPerAnalysis: number
  topMissedDiagnoses: string[]
  biasPatterns: BiasPattern[]
}

export interface BiasPattern {
  demographic: string
  overDiagnosedConditions: string[]
  underDiagnosedConditions: string[]
  confidenceDifference: number
}

/**
 * Generate model improvement recommendations
 */
export interface ImprovementRecommendation {
  agentId: string
  issue: string
  recommendation: string
  priority: "high" | "medium" | "low"
  exampleCases: string[]
}

export async function analyzePerformanceTrends(
  startDate: Date,
  endDate: Date
): Promise<PerformanceTrends> {
  // This would query DynamoDB analytics table
  // and perform statistical analysis
  
  return {
    averageConfidence: 0.82,
    consensusRate: 0.75,
    expertTriggerRate: 0.15,
    averageCompletionTime: 28000, // 28 seconds
    costPerAnalysis: 0.25,
    topMissedDiagnoses: ["Lyme disease", "Thyroid disorders", "Sleep apnea"],
    biasPatterns: [],
  }
}

/**
 * Generate recommendations for improving agent performance
 */
export function generateImprovementRecommendations(
  trends: PerformanceTrends,
  agentMetrics: AgentPerformanceMetrics[]
): ImprovementRecommendation[] {
  const recommendations: ImprovementRecommendation[] = []

  // Check for low-performing agents
  agentMetrics.forEach((metrics) => {
    if (metrics.agreementWithConsensus < 0.5) {
      recommendations.push({
        agentId: metrics.agentId,
        issue: "Low consensus agreement",
        recommendation: "Review and update system prompt to better align with diagnostic standards",
        priority: "high",
        exampleCases: [],
      })
    }

    if (metrics.confidence < 0.6) {
      recommendations.push({
        agentId: metrics.agentId,
        issue: "Consistently low confidence",
        recommendation: "Enhance prompt with more specific diagnostic criteria",
        priority: "medium",
        exampleCases: [],
      })
    }
  })

  // Check for systemic issues
  if (trends.expertTriggerRate > 0.3) {
    recommendations.push({
      agentId: "system",
      issue: "High expert trigger rate",
      recommendation: "Review trigger thresholds and enhance agent training",
      priority: "high",
      exampleCases: [],
    })
  }

  return recommendations
}

/**
 * Export data for SageMaker training
 */
export interface TrainingDataExport {
  sessionId: string
  input: {
    symptoms: string[]
    patientData: any
  }
  agentOutputs: {
    agentId: string
    diagnosis: string[]
    confidence: number
  }[]
  groundTruth?: {
    diagnosis: string
    source: "expert" | "followup" | "patient"
  }
}

export async function exportTrainingData(
  startDate: Date,
  endDate: Date
): Promise<TrainingDataExport[]> {
  // This would:
  // 1. Query DynamoDB for sessions with confirmed outcomes
  // 2. Format data for SageMaker training
  // 3. Apply privacy filters (remove PII)
  // 4. Return anonymized training dataset
  
  return []
}
