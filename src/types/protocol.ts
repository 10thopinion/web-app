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

// Model tier configuration
export type ModelTier = 'minimal' | 'dev' | 'prod';

// Get model based on tier and agent priority
function getModelForTier(tier: ModelTier, priority: 'critical' | 'standard' | 'basic'): string {
  const models = {
    minimal: {
      critical: 'us.anthropic.claude-3-5-haiku-20241022-v1:0',
      standard: 'us.anthropic.claude-3-5-haiku-20241022-v1:0',
      basic: 'us.anthropic.claude-3-5-haiku-20241022-v1:0'
    },
    dev: {
      critical: 'us.anthropic.claude-sonnet-4-20250514-v1:0',
      standard: 'us.anthropic.claude-sonnet-4-20250514-v1:0',
      basic: 'us.anthropic.claude-sonnet-4-20250514-v1:0'
    },
    prod: {
      critical: 'us.anthropic.claude-opus-4-20250514-v1:0',
      standard: 'us.anthropic.claude-sonnet-4-20250514-v1:0',
      basic: 'us.anthropic.claude-3-5-haiku-20241022-v1:0'
    }
  };
  
  return models[tier][priority];
}

// Enhanced agent configuration with meta-scrutinizing capabilities
export interface AgentConfig {
  id: string;
  name: string;
  specialization: string;
  model: string;
  approach: string;
  priority?: 'critical' | 'standard' | 'basic';
  canSee?: number[];
  scrutinizes?: string[];
  metaScrutinizes?: string; // ID of agent whose thinking to analyze
  selectiveDisclosure?: boolean; // Whether this agent gets selective context
}

// Get agent configurations based on model tier
export function getAgentConfigs(modelTier: ModelTier = 'dev') {
  return {
    blind: [
      {
        id: 'agent-1',
        name: 'First Opinion',
        specialization: 'Pattern Recognition',
        model: getModelForTier(modelTier, 'critical'),
        priority: 'critical',
        approach: 'Fast intuitive diagnosis based on common presentations',
        selectiveDisclosure: true // This agent gets selective context for meta-scrutinizing
      },
      {
        id: 'agent-2', 
        name: 'Second Opinion',
        specialization: 'Differential Diagnosis',
        model: getModelForTier(modelTier, 'standard'),
        priority: 'standard',
        approach: 'Generate comprehensive list of possibilities'
      },
      {
        id: 'agent-3',
        name: 'Third Opinion',
        specialization: 'Rare Disease Specialist', 
        model: getModelForTier(modelTier, 'standard'),
        priority: 'standard',
        approach: 'Check for uncommon conditions others might miss'
      },
      {
        id: 'agent-4',
        name: 'Fourth Opinion',
        specialization: 'Holistic Assessment',
        model: getModelForTier(modelTier, 'standard'),
        priority: 'standard',
        approach: 'Consider patient history, medications, lifestyle'
      }
    ],
    informed: [
      {
        id: 'agent-5',
        name: 'Fifth Opinion',
        specialization: 'Consensus Builder & Meta-Analyzer',
        model: getModelForTier(modelTier, 'critical'),
        priority: 'critical',
        approach: 'Find common threads and analyze reasoning patterns',
        canSee: [1, 2, 3, 4],
        metaScrutinizes: 'agent-1' // Analyzes First Opinion's thinking process
      },
      {
        id: 'agent-6',
        name: 'Sixth Opinion',
        specialization: "Devil's Advocate",
        model: getModelForTier(modelTier, 'standard'),
        priority: 'standard',
        approach: 'Actively look for what others missed',
        canSee: [1, 2, 3, 4, 5]
      },
      {
        id: 'agent-7',
        name: 'Seventh Opinion',
        specialization: 'Evidence Validator',
        model: getModelForTier(modelTier, 'standard'),
        priority: 'standard',
        approach: 'Check diagnoses against latest research',
        canSee: [1, 2, 3, 4, 5, 6]
      }
    ],
    scrutinizers: [
      {
        id: 'agent-8',
        name: 'Eighth Opinion',
        specialization: 'Hallucination Detector',
        model: getModelForTier(modelTier, 'critical'),
        priority: 'critical',
        approach: 'Identify potentially fabricated conditions',
        scrutinizes: ['Symptom consistency', 'Medical impossibilities']
      },
      {
        id: 'agent-9',
        name: 'Ninth Opinion',
        specialization: 'Bias Auditor',
        model: getModelForTier(modelTier, 'basic'),
        priority: 'basic',
        approach: 'Check for demographic/geographic biases',
        scrutinizes: ['Treatment disparities', 'Diagnostic bias patterns']
      }
    ],
    final: {
      id: 'agent-10',
      name: 'Tenth Opinion',
      specialization: 'Final Authority',
      model: getModelForTier(modelTier, 'critical'),
      priority: 'critical',
      approach: 'Weighted synthesis with confidence scoring',
      weights: {
        blindConsensus: 0.3,
        expertValidation: 0.25,
        scrutinizerFlags: 0.25,
        evidenceStrength: 0.2
      }
    }
  };
}

// Export the configurations dynamically to ensure env vars are loaded
export const AGENT_CONFIGS = getAgentConfigs((process.env.MODEL_SETUP as ModelTier) || 'dev');

// Cost estimation per tier
export const TIER_COSTS = {
  minimal: {
    perAnalysis: '$0.01-$0.02',
    description: 'Claude 3.5 Haiku only - fastest and cheapest'
  },
  dev: {
    perAnalysis: '$0.03-$0.08',
    description: 'Claude Sonnet 4 only - balanced performance'
  },
  prod: {
    perAnalysis: '$0.05-$0.15',
    description: 'Claude Opus 4 + Sonnet 4 - highest quality'
  }
};
