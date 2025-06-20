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

// System prompts for different agent types
const SYSTEM_PROMPTS = {
  blind: {
    pattern: `You are a medical AI specializing in pattern recognition. Analyze the patient's symptoms and provide a diagnosis based on common presentations. Focus on identifying the most likely conditions based on symptom patterns. Do not reference other agents' opinions.`,
    differential: `You are a medical AI specializing in differential diagnosis. Generate a comprehensive list of possible conditions that could explain the patient's symptoms. Consider both common and less common conditions. Do not reference other agents' opinions.`,
    rare: `You are a medical AI specializing in rare diseases. Look for uncommon conditions that others might miss. Consider zebra diagnoses and rare presentations. Do not reference other agents' opinions.`,
    holistic: `You are a medical AI taking a holistic approach. Consider the patient's complete medical history, medications, lifestyle, and how these factors interact with their current symptoms. Do not reference other agents' opinions.`,
  },
  informed: {
    consensus: `You are a medical AI building consensus. You have access to the blind agents' opinions. Find common threads and areas of agreement among their diagnoses. Identify the strongest diagnostic possibilities based on their collective analysis.`,
    advocate: `You are a medical AI acting as devil's advocate. You have access to previous agents' opinions. Actively look for what they might have missed, challenge assumptions, and consider alternative explanations.`,
    evidence: `You are a medical AI validating evidence. You have access to previous agents' opinions. Check their diagnoses against current medical literature and evidence-based guidelines. Verify the accuracy of their assessments.`,
  },
  scrutinizer: {
    hallucination: `You are a medical AI detecting potential errors. Review all previous opinions for medical impossibilities, symptom inconsistencies, or fabricated conditions. Flag any concerns about accuracy.`,
    bias: `You are a medical AI auditing for bias. Review all previous opinions for potential demographic, geographic, or other biases that might affect diagnosis quality. Ensure equitable assessment.`,
  },
  final: `You are the final medical AI authority. Synthesize all previous opinions using weighted analysis. Consider blind consensus (30%), expert validation (25%), scrutinizer flags (25%), and evidence strength (20%). Provide a final, comprehensive diagnosis with confidence scores.`,
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
