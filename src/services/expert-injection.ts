import { AgentOpinion } from "@/types/medical"
import { ExpertTrigger } from "@/types/protocol"

export interface ExpertInjectionCriteria {
  lowConfidenceThreshold: number
  highDisagreementThreshold: number
  rareConditionKeywords: string[]
  urgentSymptoms: string[]
}

const DEFAULT_CRITERIA: ExpertInjectionCriteria = {
  lowConfidenceThreshold: 0.6,
  highDisagreementThreshold: 0.4,
  rareConditionKeywords: [
    "genetic disorder",
    "orphan disease",
    "rare condition",
    "autoimmune",
    "metabolic disorder",
    "chromosomal abnormality",
  ],
  urgentSymptoms: [
    "chest pain",
    "difficulty breathing",
    "severe headache",
    "loss of consciousness",
    "seizure",
    "stroke symptoms",
    "severe bleeding",
    "anaphylaxis",
  ],
}

/**
 * Determine if expert review should be triggered based on agent opinions
 */
export function checkExpertTrigger(
  opinions: AgentOpinion[],
  patientRequest: boolean = false,
  criteria: ExpertInjectionCriteria = DEFAULT_CRITERIA
): ExpertTrigger | null {
  // 1. Patient request always triggers expert review
  if (patientRequest) {
    return {
      triggered: true,
      reason: "patient_request",
      threshold: 1.0,
      recommendation: "Patient has requested expert review. Connecting to specialist.",
    }
  }

  // 2. Check for low confidence across agents
  const averageConfidence =
    opinions.reduce((sum, op) => sum + op.confidence, 0) / opinions.length

  if (averageConfidence < criteria.lowConfidenceThreshold) {
    return {
      triggered: true,
      reason: "low_confidence",
      threshold: averageConfidence,
      recommendation: `Average confidence (${Math.round(
        averageConfidence * 100
      )}%) is below threshold. Expert consultation recommended.`,
    }
  }

  // 3. Check for high disagreement among agents
  const disagreementScore = calculateDisagreement(opinions)
  
  if (disagreementScore > criteria.highDisagreementThreshold) {
    return {
      triggered: true,
      reason: "high_disagreement",
      threshold: disagreementScore,
      recommendation: `High disagreement (${Math.round(
        disagreementScore * 100
      )}%) among agents. Expert arbitration needed.`,
    }
  }

  // 4. Check for rare conditions
  const hasRareCondition = opinions.some((opinion) =>
    opinion.diagnosis.some((diag) =>
      criteria.rareConditionKeywords.some((keyword) =>
        diag.toLowerCase().includes(keyword.toLowerCase())
      )
    )
  )

  if (hasRareCondition) {
    return {
      triggered: true,
      reason: "rare_condition",
      threshold: 1.0,
      recommendation: "Rare or complex condition identified. Specialist consultation advised.",
    }
  }

  // 5. Check for urgent symptoms in red flags
  const hasUrgentSymptoms = opinions.some((opinion) =>
    opinion.redFlags?.some((flag) =>
      criteria.urgentSymptoms.some((symptom) =>
        flag.toLowerCase().includes(symptom.toLowerCase())
      )
    )
  )

  if (hasUrgentSymptoms) {
    return {
      triggered: true,
      reason: "high_disagreement", // Using existing reason type
      threshold: 1.0,
      recommendation: "Urgent symptoms detected. Immediate expert review required.",
    }
  }

  return null
}

/**
 * Calculate disagreement score among agent opinions
 */
function calculateDisagreement(opinions: AgentOpinion[]): number {
  // Get all unique diagnoses
  const allDiagnoses = new Set<string>()
  opinions.forEach((op) => op.diagnosis.forEach((d) => allDiagnoses.add(d.toLowerCase())))

  // Count how many agents agree on each diagnosis
  const diagnosisFrequency = new Map<string, number>()
  
  opinions.forEach((op) => {
    op.diagnosis.forEach((d) => {
      const key = d.toLowerCase()
      diagnosisFrequency.set(key, (diagnosisFrequency.get(key) || 0) + 1)
    })
  })

  // Calculate disagreement as 1 - (consensus ratio)
  const maxAgreement = Math.max(...diagnosisFrequency.values())
  const consensusRatio = maxAgreement / opinions.length
  
  return 1 - consensusRatio
}

/**
 * Expert injection point configurations
 */
export enum ExpertInjectionPoint {
  BETWEEN_5_AND_6 = "between_5_and_6", // After consensus, before devil's advocate
  OVERRIDE_TENTH = "override_tenth", // Replace final authority
  ADDITIONAL_ELEVENTH = "additional_eleventh", // Add as 11th opinion
}

/**
 * Mock expert opinion for demonstration
 * In production, this would connect to a real expert system or human specialist
 */
export async function getExpertOpinion(
  patientData: any,
  previousOpinions: AgentOpinion[],
  injectionPoint: ExpertInjectionPoint
): Promise<AgentOpinion> {
  // In a real implementation, this would:
  // 1. Send case to expert queue
  // 2. Notify on-call specialist
  // 3. Provide interface for expert to review
  // 4. Return expert's assessment

  return {
    agentId: "expert-human",
    agentName: "Human Expert",
    agentType: "informed",
    specialization: "Board-Certified Specialist",
    diagnosis: ["Expert review pending"],
    confidence: 0.95,
    reasoning: "Human expert review has been triggered. A specialist will review this case.",
    redFlags: [],
    recommendations: [
      "Await specialist consultation",
      "Monitor patient closely",
      "Prepare for potential immediate intervention",
    ],
    timestamp: new Date(),
    model: "human-expert",
  }
}

/**
 * Record expert feedback for continuous improvement
 */
export interface ExpertFeedback {
  sessionId: string
  expertId: string
  agreedWithAI: boolean
  correctDiagnosis?: string[]
  aiMissedSymptoms?: string[]
  additionalNotes?: string
  timestamp: Date
}

export async function recordExpertFeedback(feedback: ExpertFeedback): Promise<void> {
  // This would save to DynamoDB for model improvement
  console.log("Recording expert feedback:", feedback)
  
  // In production:
  // 1. Save to DynamoDB
  // 2. Trigger retraining pipeline if patterns emerge
  // 3. Update agent prompts based on feedback
}
