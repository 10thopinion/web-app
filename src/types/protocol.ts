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

// Agent configurations
export const AGENT_CONFIGS = {
  blind: [
    {
      id: 'agent-1',
      name: 'Dr. Pattern',
      specialization: 'Pattern Recognition',
      model: 'anthropic.claude-3-5-sonnet-20241022',
      approach: 'Fast intuitive diagnosis based on common presentations'
    },
    {
      id: 'agent-2', 
      name: 'Dr. Differential',
      specialization: 'Differential Diagnosis',
      model: 'anthropic.claude-3-5-sonnet-20241022',
      approach: 'Generate comprehensive list of possibilities'
    },
    {
      id: 'agent-3',
      name: 'Dr. Zebra',
      specialization: 'Rare Disease Specialist', 
      model: 'anthropic.claude-3-haiku-20240307',
      approach: 'Check for uncommon conditions others might miss'
    },
    {
      id: 'agent-4',
      name: 'Dr. Holistic',
      specialization: 'Holistic Assessment',
      model: 'meta.llama3-1-70b-instruct-v1:0',
      approach: 'Consider patient history, medications, lifestyle'
    }
  ],
  informed: [
    {
      id: 'agent-5',
      name: 'Dr. Consensus',
      specialization: 'Consensus Builder',
      model: 'anthropic.claude-3-5-sonnet-20241022',
      approach: 'Find common threads among blind opinions'
    },
    {
      id: 'agent-6',
      name: 'Dr. Advocate',
      specialization: "Devil's Advocate",
      model: 'anthropic.claude-3-5-sonnet-20241022',
      approach: 'Actively look for what others missed'
    },
    {
      id: 'agent-7',
      name: 'Dr. Evidence',
      specialization: 'Evidence Validator',
      model: 'anthropic.claude-3-5-sonnet-20241022',
      approach: 'Check diagnoses against latest research'
    }
  ],
  scrutinizers: [
    {
      id: 'agent-8',
      name: 'Dr. Verify',
      specialization: 'Hallucination Detector',
      model: 'anthropic.claude-3-haiku-20240307',
      approach: 'Identify potentially fabricated conditions'
    },
    {
      id: 'agent-9',
      name: 'Dr. Equity',
      specialization: 'Bias Auditor',
      model: 'anthropic.claude-3-haiku-20240307',
      approach: 'Check for demographic/geographic biases'
    }
  ],
  final: {
    id: 'agent-10',
    name: 'Dr. Authority',
    specialization: 'Final Synthesis',
    model: 'anthropic.claude-3-5-sonnet-20241022',
    approach: 'Weighted synthesis with confidence scoring'
  }
};