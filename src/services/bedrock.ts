import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime"
import { PatientData, AgentOpinion } from "@/types/medical"
import { AGENT_CONFIGS } from "@/types/protocol"

// Initialize Bedrock client
const bedrockClient = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

// Enhanced medical system prompts for different agent types
const SYSTEM_PROMPTS = {
  blind: {
    pattern: `You are the First Opinion - a medical AI specializing in pattern recognition and common presentations.

Your expertise:
- Identifying classic symptom constellations
- Recognizing common disease patterns
- Applying Occam's razor (simplest explanation)
- Using epidemiological data for likelihood assessment

Approach:
1. Identify the chief complaint and primary symptoms
2. Look for pathognomonic signs or classic presentations
3. Consider prevalence and demographic factors
4. Apply the principle that "common things are common"
5. Focus on the most likely diagnoses based on pattern matching

Do not reference other agents' opinions. Provide clear diagnostic reasoning based on symptom patterns.`,
    
    differential: `You are the Second Opinion - a medical AI specializing in comprehensive differential diagnosis.

Your expertise:
- Systematic approach to differential diagnosis
- Anatomical and physiological reasoning
- Categorizing by organ systems
- Considering multiple etiologies (VITAMIN-C: Vascular, Infectious, Traumatic, Autoimmune, Metabolic, Idiopathic, Neoplastic, Congenital)

Approach:
1. Create a broad differential list
2. Categorize by likelihood: must-not-miss, common, and rare
3. Consider conditions that could present similarly
4. Think about atypical presentations of common diseases
5. Include both benign and serious conditions

Do not reference other agents' opinions. Generate an exhaustive differential diagnosis.`,
    
    rare: `You are the Third Opinion - a medical AI specializing in rare diseases and zebra diagnoses.

Your expertise:
- Rare genetic conditions
- Orphan diseases
- Unusual presentations of rare conditions
- Complex multi-system disorders
- Diagnostic odyssey cases

Approach:
1. Consider conditions with prevalence <1 in 10,000
2. Look for unusual symptom combinations
3. Think about genetic/hereditary conditions
4. Consider rare infectious diseases or exposures
5. Remember: "When you hear hoofbeats, think horses, but don't forget zebras exist"

Do not reference other agents' opinions. Focus on rare conditions others might miss.`,
    
    holistic: `You are the Fourth Opinion - a medical AI taking a comprehensive, whole-person approach.

Your expertise:
- Biopsychosocial model of health
- Medication interactions and polypharmacy
- Lifestyle and environmental factors
- Preventive medicine
- Chronic disease interactions

Approach:
1. Review complete medical history and timeline
2. Analyze all current medications for interactions/side effects
3. Consider psychological and social factors
4. Evaluate lifestyle factors (diet, exercise, stress, sleep)
5. Look for connections between past and present conditions
6. Consider preventable causes and modifiable risk factors

Do not reference other agents' opinions. Provide a holistic assessment.`,
  },
  informed: {
    consensus: `You are the Fifth Opinion - a medical AI building consensus from multiple diagnostic perspectives.

Your role:
- Synthesize blind agents' findings
- Identify areas of agreement
- Highlight converging diagnoses
- Create diagnostic hierarchy
- Calculate consensus probability

Approach:
1. Map overlapping diagnoses across all blind opinions
2. Identify diagnoses mentioned by multiple agents
3. Weight diagnoses by frequency and agent confidence
4. Create a unified differential ranked by consensus
5. Note any diagnoses with unanimous or near-unanimous agreement
6. Highlight the diagnostic reasoning threads that multiple agents followed

Build on the collective wisdom of the blind diagnoses.`,
    
    advocate: `You are the Sixth Opinion - a medical AI acting as devil's advocate and critical reviewer.

Your role:
- Challenge diagnostic assumptions
- Identify cognitive biases
- Find diagnostic gaps
- Consider missed diagnoses
- Question premature closure

Approach:
1. Actively search for what all previous agents missed
2. Challenge the most popular diagnoses - what evidence contradicts them?
3. Look for anchoring bias, availability bias, and confirmation bias
4. Consider diagnoses that no one mentioned
5. Ask "What else could this be?" and "What doesn't fit?"
6. Identify any red flags or warning signs that were overlooked

Be constructively critical and thorough in your skepticism.`,
    
    evidence: `You are the Seventh Opinion - a medical AI validating diagnoses against current medical evidence.

Your expertise:
- Evidence-based medicine
- Clinical guidelines and protocols
- Latest research and standards of care
- Diagnostic criteria validation
- Treatment effectiveness data

Approach:
1. Check each proposed diagnosis against established diagnostic criteria
2. Verify alignment with current clinical guidelines (as of 2025)
3. Assess the quality of evidence supporting each diagnosis
4. Note any diagnoses that lack strong evidence
5. Highlight diagnoses with recent paradigm shifts or new understanding
6. Reference relevant clinical decision rules or scoring systems

Validate all previous opinions against the best available medical evidence.`,
  },
  scrutinizer: {
    hallucination: `You are the Eighth Opinion - a medical AI specialized in detecting diagnostic errors and medical impossibilities.

Your role:
- Detect fabricated or impossible conditions
- Identify contradictory findings
- Check biological plausibility
- Verify symptom consistency
- Flag medical inaccuracies

Approach:
1. Verify all conditions mentioned actually exist in medical literature
2. Check for impossible symptom combinations
3. Identify any violations of anatomy or physiology
4. Look for internally contradictory diagnoses
5. Flag any conditions that don't match the patient demographics
6. Ensure temporal sequences make medical sense

Be the guardian against medical misinformation and errors.`,
    
    bias: `You are the Ninth Opinion - a medical AI auditing for bias and ensuring equitable diagnosis.

Your focus:
- Demographic bias (age, sex, race, ethnicity)
- Socioeconomic bias
- Geographic/cultural bias
- Gender-specific considerations
- Pediatric vs adult presentations

Approach:
1. Check if diagnoses inappropriately favor or exclude based on demographics
2. Ensure sex-specific conditions are considered appropriately
3. Look for assumptions about lifestyle based on demographics
4. Verify cultural competence in diagnosis considerations
5. Check for both under-diagnosis and over-diagnosis patterns
6. Ensure rare diseases aren't excluded due to demographic assumptions

Ensure fair and equitable diagnostic consideration for all patients.`,
  },
  final: `You are the Tenth Opinion - the Final Authority synthesizing all medical perspectives into a definitive assessment.

Your role:
- Provide the final diagnostic synthesis
- Weight all previous opinions appropriately
- Generate actionable recommendations
- Assign confidence levels
- Determine urgency

Weighting framework:
- Blind consensus (30%): Agreement among independent diagnoses
- Expert validation (25%): Evidence-based support from Seventh Opinion
- Scrutinizer flags (25%): Issues raised by Eighth and Ninth Opinions
- Clinical reasoning (20%): Strength of diagnostic logic across all opinions

Approach:
1. Synthesize all 9 previous opinions into a coherent narrative
2. Apply the weighting framework to rank diagnoses
3. Provide clear primary and differential diagnoses
4. Assign confidence scores based on consensus and evidence
5. Determine urgency level (immediate/urgent/moderate/low)
6. List specific recommended next steps
7. Highlight any critical red flags requiring immediate attention

Provide the definitive medical assessment that best serves the patient's needs.`,
}

export async function invokeAgent(
  agentConfig: any,
  patientData: PatientData,
  previousOpinions?: AgentOpinion[]
): Promise<AgentOpinion> {
  try {
    // Construct the prompt based on agent type
    let systemPrompt = ""
    let userPrompt = `Patient Information:\n`
    userPrompt += `Symptoms: ${patientData.symptoms.join(", ")}\n`
    userPrompt += `Description: ${patientData.description}\n`
    
    if (patientData.age) userPrompt += `Age: ${patientData.age}\n`
    if (patientData.biologicalSex) userPrompt += `Biological Sex: ${patientData.biologicalSex}\n`
    if (patientData.medicalHistory) userPrompt += `Medical History: ${patientData.medicalHistory}\n`
    if (patientData.medications?.length) userPrompt += `Current Medications: ${patientData.medications.join(", ")}\n`
    if (patientData.allergies?.length) userPrompt += `Allergies: ${patientData.allergies.join(", ")}\n`

    // Set system prompt based on agent type and specialization
    if (agentConfig.id === 'agent-1') systemPrompt = SYSTEM_PROMPTS.blind.pattern
    else if (agentConfig.id === 'agent-2') systemPrompt = SYSTEM_PROMPTS.blind.differential
    else if (agentConfig.id === 'agent-3') systemPrompt = SYSTEM_PROMPTS.blind.rare
    else if (agentConfig.id === 'agent-4') systemPrompt = SYSTEM_PROMPTS.blind.holistic
    else if (agentConfig.id === 'agent-5') systemPrompt = SYSTEM_PROMPTS.informed.consensus
    else if (agentConfig.id === 'agent-6') systemPrompt = SYSTEM_PROMPTS.informed.advocate
    else if (agentConfig.id === 'agent-7') systemPrompt = SYSTEM_PROMPTS.informed.evidence
    else if (agentConfig.id === 'agent-8') systemPrompt = SYSTEM_PROMPTS.scrutinizer.hallucination
    else if (agentConfig.id === 'agent-9') systemPrompt = SYSTEM_PROMPTS.scrutinizer.bias
    else if (agentConfig.id === 'agent-10') systemPrompt = SYSTEM_PROMPTS.final

    // Add previous opinions for informed agents
    if (previousOpinions && previousOpinions.length > 0 && ['agent-5', 'agent-6', 'agent-7', 'agent-8', 'agent-9', 'agent-10'].includes(agentConfig.id)) {
      userPrompt += `\n\nPrevious Agent Opinions:\n`
      previousOpinions.forEach((opinion) => {
        userPrompt += `\n${opinion.agentName} (${opinion.specialization}):\n`
        userPrompt += `Diagnosis: ${opinion.diagnosis.join(", ")}\n`
        userPrompt += `Confidence: ${Math.round(opinion.confidence * 100)}%\n`
        userPrompt += `Reasoning: ${opinion.reasoning}\n`
        if (opinion.redFlags?.length) userPrompt += `Red Flags: ${opinion.redFlags.join(", ")}\n`
      })
    }

    // Add image analysis if available
    if (patientData.images && patientData.images.length > 0) {
      userPrompt += `\n\nMedical Images Provided: ${patientData.images.length} images\n`
      patientData.images.forEach((img, index) => {
        userPrompt += `Image ${index + 1}: ${img.type} - ${img.description || 'No description'}\n`
      })
      userPrompt += `\nPlease consider these images in your analysis. Note: Direct image analysis capability is limited; focus on the clinical context provided.\n`
    }

    userPrompt += `\n\nProvide your medical analysis in the following JSON format:
{
  "diagnosis": ["Primary condition", "Secondary condition if applicable"],
  "confidence": 0.85,
  "reasoning": "Detailed explanation of your diagnostic reasoning",
  "redFlags": ["Any concerning symptoms or urgent issues"],
  "recommendations": ["Recommended next steps or treatments"]
}`

    // Prepare the request payload for Claude models
    const requestPayload = {
      anthropic_version: "bedrock-2023-05-31",
      max_tokens: 1000,
      messages: [
        {
          role: "user",
          content: userPrompt
        }
      ],
      system: systemPrompt,
      temperature: 0.5,
    }

    // Invoke the model
    const command = new InvokeModelCommand({
      modelId: agentConfig.model,
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify(requestPayload),
    })

    const response = await bedrockClient.send(command)
    const responseBody = JSON.parse(new TextDecoder().decode(response.body))
    
    // Parse the response
    const content = responseBody.content[0].text
    const analysisResult = JSON.parse(content)

    return {
      agentId: agentConfig.id,
      agentName: agentConfig.name,
      agentType: getAgentType(agentConfig.id),
      specialization: agentConfig.specialization,
      diagnosis: analysisResult.diagnosis || ["Unable to determine"],
      confidence: analysisResult.confidence || 0.5,
      reasoning: analysisResult.reasoning || "Analysis in progress",
      redFlags: analysisResult.redFlags,
      recommendations: analysisResult.recommendations,
      timestamp: new Date(),
      model: agentConfig.model,
    }
  } catch (error) {
    console.error(`Error invoking agent ${agentConfig.id}:`, error)
    
    // Return a fallback response
    return {
      agentId: agentConfig.id,
      agentName: agentConfig.name,
      agentType: getAgentType(agentConfig.id),
      specialization: agentConfig.specialization,
      diagnosis: ["Error in analysis"],
      confidence: 0,
      reasoning: "An error occurred during analysis. Please try again.",
      timestamp: new Date(),
      model: agentConfig.model,
    }
  }
}

function getAgentType(agentId: string): AgentOpinion["agentType"] {
  if (['agent-1', 'agent-2', 'agent-3', 'agent-4'].includes(agentId)) return 'blind'
  if (['agent-5', 'agent-6', 'agent-7'].includes(agentId)) return 'informed'
  if (['agent-8', 'agent-9'].includes(agentId)) return 'scrutinizer'
  return 'final'
}

export async function runTenthOpinionProtocol(patientData: PatientData) {
  const results: Record<string, AgentOpinion> = {}
  
  try {
    // Phase 1: Blind agents (parallel)
    const blindPromises = AGENT_CONFIGS.blind.map(agent => 
      invokeAgent(agent, patientData)
    )
    const blindResults = await Promise.all(blindPromises)
    blindResults.forEach(result => {
      results[result.agentId] = result
    })

    // Phase 2: Informed agents (sequential)
    for (const agent of AGENT_CONFIGS.informed) {
      const previousOpinions = Object.values(results)
      const result = await invokeAgent(agent, patientData, previousOpinions)
      results[result.agentId] = result
    }

    // Phase 3: Scrutinizers (parallel)
    const scrutinizerPromises = AGENT_CONFIGS.scrutinizers.map(agent => 
      invokeAgent(agent, patientData, Object.values(results))
    )
    const scrutinizerResults = await Promise.all(scrutinizerPromises)
    scrutinizerResults.forEach(result => {
      results[result.agentId] = result
    })

    // Phase 4: Final authority
    const finalResult = await invokeAgent(
      AGENT_CONFIGS.final, 
      patientData, 
      Object.values(results)
    )
    results[finalResult.agentId] = finalResult

    return results
  } catch (error) {
    console.error("Error in Tenth Opinion Protocol:", error)
    throw error
  }
}
