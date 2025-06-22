// Utility functions for optimizing prompts to fit within token limits

export interface OptimizedPrompt {
  original: string
  optimized: string
  originalTokens: number
  optimizedTokens: number
  compressionRatio: number
}

// Count tokens in a string (rough estimation)
export function countTokens(text: string): number {
  // Rough estimation: 1 token ≈ 4 characters for English text
  // This is a simplified approach since we don't have access to the exact tokenizer
  return Math.ceil(text.length / 4)
}

// Optimize a prompt by removing redundant content while preserving medical accuracy
export function optimizePrompt(prompt: string): OptimizedPrompt {
  const originalTokens = countTokens(prompt)
  
  // Step 1: Remove excessive whitespace and formatting
  let optimized = prompt
    .replace(/\n{3,}/g, '\n\n')  // Multiple newlines to double
    .replace(/\s{2,}/g, ' ')      // Multiple spaces to single
    .trim()
  
  // Step 2: Compress verbose instructions
  const compressions = [
    // Remove redundant phrases
    [/Your expertise includes?:/gi, 'Expertise:'],
    [/Your approach should be:/gi, 'Approach:'],
    [/IMPORTANT INSTRUCTIONS?:/gi, 'CRITICAL:'],
    [/Do not reference other agents'? opinions?\./gi, ''],
    [/Provide clear diagnostic reasoning based on.*$/gm, ''],
    
    // Shorten common medical phrases
    [/differential diagnosis/gi, 'DDx'],
    [/pathognomonic signs/gi, 'pathognomonic'],
    [/epidemiological data/gi, 'epidemiology'],
    [/comprehensive assessment/gi, 'full assessment'],
    [/medical history/gi, 'PMH'],
    [/medications/gi, 'meds'],
    [/anatomical and physiological/gi, 'anatomical/physiological'],
    
    // Compress lists
    [/\d+\.\s+/g, '• '],  // Numbered lists to bullets
    [/\s*-\s*/g, '• '],   // Dashes to bullets
  ]
  
  compressions.forEach(([pattern, replacement]) => {
    optimized = optimized.replace(pattern as RegExp, replacement as string)
  })
  
  // Step 3: Remove example lists if present
  optimized = optimized.replace(/\(e\.g\.,?[^)]+\)/g, '')
  
  // Step 4: Condense whitespace again
  optimized = optimized
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .join('\n')
  
  const optimizedTokens = countTokens(optimized)
  
  return {
    original: prompt,
    optimized,
    originalTokens,
    optimizedTokens,
    compressionRatio: optimizedTokens / originalTokens
  }
}

// Get the most essential version of a prompt for extreme token constraints
export function getMinimalPrompt(agentType: string, agentName: string): string {
  const minimalPrompts: Record<string, string> = {
    'pattern': `${agentName}: Pattern recognition specialist. Identify common presentations, apply Occam's razor. Focus on likely diagnoses.`,
    'differential': `${agentName}: DDx specialist. Create systematic differential, categorize by likelihood and urgency.`,
    'rare': `${agentName}: Rare disease specialist. Check for uncommon conditions others might miss.`,
    'holistic': `${agentName}: Holistic assessment. Consider full patient context, lifestyle, medications, history.`,
    'consensus': `${agentName}: Consensus builder. Synthesize previous opinions, find common ground, resolve conflicts.`,
    'devil': `${agentName}: Devil's advocate. Challenge assumptions, identify what others missed, question diagnoses.`,
    'evidence': `${agentName}: Evidence validator. Check against latest research, evaluate diagnostic accuracy.`,
    'hallucination': `${agentName}: Hallucination detector. Identify impossible conditions, check medical validity.`,
    'bias': `${agentName}: Bias auditor. Check for demographic biases, ensure equitable assessment.`,
    'final': `${agentName}: Final authority. Synthesize all opinions, provide weighted conclusion with confidence scores.`
  }
  
  return minimalPrompts[agentType] || `${agentName}: Medical AI specialist. Analyze and provide diagnosis.`
}

// Dynamically adjust prompt based on available token budget
export function adjustPromptForTokenBudget(
  fullPrompt: string, 
  tokenBudget: number,
  agentType: string,
  agentName: string
): string {
  const currentTokens = countTokens(fullPrompt)
  
  // If under budget, use full prompt
  if (currentTokens <= tokenBudget) {
    return fullPrompt
  }
  
  // Try optimization first
  const optimized = optimizePrompt(fullPrompt)
  if (optimized.optimizedTokens <= tokenBudget) {
    return optimized.optimized
  }
  
  // If still over budget, use minimal prompt
  return getMinimalPrompt(agentType, agentName)
}
