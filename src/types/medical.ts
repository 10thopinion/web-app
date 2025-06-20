export interface PatientData {
  id: string;
  symptoms: string[];
  description: string;
  medicalHistory?: string;
  medications?: string[];
  allergies?: string[];
  images?: UploadedImage[];
  age?: number;
  biologicalSex?: 'male' | 'female' | 'other';
  timestamp: Date;
}

export interface UploadedImage {
  id: string;
  url: string;
  type: 'xray' | 'skin' | 'scan' | 'other';
  description?: string;
  analysisResults?: ImageAnalysis;
}

export interface ImageAnalysis {
  findings: string[];
  abnormalities: string[];
  confidence: number;
}

export interface AgentOpinion {
  agentId: string;
  agentName: string;
  agentType: 'blind' | 'informed' | 'scrutinizer' | 'final';
  specialization: string;
  diagnosis: string[];
  confidence: number;
  reasoning: string;
  redFlags?: string[];
  recommendations?: string[];
  timestamp: Date;
  model: string;
}