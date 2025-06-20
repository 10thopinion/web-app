import { PatientData, AgentOpinion } from './medical'

export interface TenthOpinionProtocol {
  sessionId: string;
  patientData: PatientData;
  agents: {
    blindAgents: AgentOpinion[];
    informedAgents: AgentOpinion[];
    scrutinizers: AgentOpinion[];
    finalAuthority?: AgentOpinion;
  };
  summary?: ProtocolSummary;
  expertTrigger?: ExpertTrigger;
  startTime: Date;
  endTime?: Date;
  status: 'initializing' | 'collecting' | 'analyzing' | 'complete' | 'error';
}

export interface ProtocolSummary {
  primaryDiagnosis: {
    condition: string;
    confidence: number;
    icd10Code?: string;
  };
  alternativeDiagnoses: Array<{
    condition: string;
    confidence: number;
    icd10Code?: string;
  }>;
  urgencyLevel: 'immediate' | 'urgent' | 'moderate' | 'low';
  redFlags: string[];
  recommendedActions: string[];
  consensus: number; // 0-1 scale of agent agreement
}

export interface ExpertTrigger {
  triggered: boolean;
  reason: 'low_confidence' | 'high_disagreement' | 'rare_condition' | 'patient_request';
  threshold: number;
  recommendation: string;
}

// Agent configurations - Using latest Claude 4 models (June 2025)
export const AGENT_CONFIGS = {
  blind: [
    {
      id: 'agent-1',
      name: 'First Opinion',
      specialization: 'Pattern Recognition',
      model: 'anthropic.claude-opus-4-20250515',
      approach: 'Fast intuitive diagnosis based on common presentations'
    },
    {
      id: 'agent-2', 
      name: 'Second Opinion',
      specialization: 'Differential Diagnosis',
      model: 'anthropic.claude-opus-4-20250515',
      approach: 'Generate comprehensive list of possibilities'
    },
    {
      id: 'agent-3',
      name: 'Third Opinion',
      specialization: 'Rare Disease Specialist', 
      model: 'anthropic.claude-sonnet-4-20250515',
      approach: 'Check for uncommon conditions others might miss'
    },
    {
      id: 'agent-4',
      name: 'Fourth Opinion',
      specialization: 'Holistic Assessment',
      model: 'anthropic.claude-opus-4-20250515',
      approach: 'Consider patient history, medications, lifestyle'
    }
  ],
  informed: [
    {
      id: 'agent-5',
      name: 'Fifth Opinion',
      specialization: 'Consensus Builder',
      model: 'anthropic.claude-opus-4-20250515',
      approach: 'Find common threads among blind opinions',
      canSee: [1, 2, 3, 4]
    },
    {
      id: 'agent-6',
      name: 'Sixth Opinion',
      specialization: "Devil's Advocate",
      model: 'anthropic.claude-sonnet-4-20250515',
      approach: 'Actively look for what others missed',
      canSee: [1, 2, 3, 4, 5]
    },
    {
      id: 'agent-7',
      name: 'Seventh Opinion',
      specialization: 'Evidence Validator',
      model: 'anthropic.claude-opus-4-20250515',
      approach: 'Check diagnoses against latest research',
      canSee: [1, 2, 3, 4, 5, 6]
    }
  ],
  scrutinizers: [
    {
      id: 'agent-8',
      name: 'Eighth Opinion',
      specialization: 'Hallucination Detector',
      model: 'anthropic.claude-3-5-haiku-20240307',
      approach: 'Identify potentially fabricated conditions',
      scrutinizes: ['Symptom consistency', 'Medical impossibilities']
    },
    {
      id: 'agent-9',
      name: 'Ninth Opinion',
      specialization: 'Bias Auditor',
      model: 'anthropic.claude-3-5-haiku-20240307',
      approach: 'Check for demographic/geographic biases',
      scrutinizes: ['Treatment disparities', 'Diagnostic bias patterns']
    }
  ],
  final: {
    id: 'agent-10',
    name: 'Tenth Opinion',
    specialization: 'Final Authority',
    model: 'anthropic.claude-opus-4-20250515',
    approach: 'Weighted synthesis with confidence scoring',
    weights: {
      blindConsensus: 0.3,
      expertValidation: 0.25,
      scrutinizerFlags: 0.25,
      evidenceStrength: 0.2
    }
  }
};