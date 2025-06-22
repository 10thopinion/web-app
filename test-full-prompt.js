import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";

const client = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

async function testAgentWithFullPrompt(agentName, systemPrompt) {
  console.log(`\nTesting ${agentName}...`);
  console.log(`System prompt length: ${systemPrompt.length} characters`);
  
  const userPrompt = `Patient Information:
Symptoms (by system):
  General: fever, fatigue
  Neurological: headache
Additional Symptoms: severe headache, high fever
Description: Patient has been experiencing severe headaches and high fever for 2 days
Age: 35
Biological Sex: Female
Medical History: No significant past medical history
Current Medications: None
Allergies: None

Provide your medical analysis in the following JSON format:
{
  "diagnosis": ["Primary condition", "Secondary condition if applicable"],
  "confidence": 0.85,
  "reasoning": "Detailed explanation of your diagnostic reasoning",
  "redFlags": ["Any concerning symptoms or urgent issues"],
  "recommendations": ["Recommended next steps or treatments"]
}

IMPORTANT: Your response should focus on the medical analysis only. Do not include any disclaimers about the limitations of AI or when to seek medical care - these are handled separately by the system.`;

  try {
    const command = new InvokeModelCommand({
      modelId: "us.anthropic.claude-3-5-haiku-20241022-v1:0",
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify({
        anthropic_version: "bedrock-2023-05-31",
        max_tokens: 1000,
        messages: [{ 
          role: "user", 
          content: userPrompt
        }],
        system: systemPrompt,
        temperature: 0.5,
      }),
    });
    
    const response = await client.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    
    console.log(`✅ SUCCESS`);
    console.log(`Usage:`, responseBody.usage);
    
    const content = responseBody.content[0].text;
    console.log(`\nRaw Response (first 200 chars):`);
    console.log(content.substring(0, 200) + '...');
    
    // Try to parse as JSON
    let jsonContent = content;
    if (content.includes('```json')) {
      jsonContent = content.match(/```json\s*([\s\S]*?)\s*```/)?.[1] || content;
    } else if (content.includes('```')) {
      jsonContent = content.match(/```\s*([\s\S]*?)\s*```/)?.[1] || content;
    }
    
    try {
      const parsed = JSON.parse(jsonContent.trim());
      console.log(`\n✅ JSON parsing successful`);
      console.log(`Diagnosis:`, parsed.diagnosis);
      console.log(`Confidence:`, parsed.confidence);
    } catch (parseError) {
      console.error(`\n❌ JSON parsing failed:`, parseError.message);
      console.log(`\nFull response for debugging:`);
      console.log(content);
    }
    
  } catch (error) {
    console.error(`❌ ${agentName} FAILED:`, error.name);
    console.error(`Message:`, error.message);
  }
}

// Test a few agents with their actual prompts
async function main() {
  console.log("Testing Agents with Full System Prompts");
  console.log("========================================");
  
  // Import the prompts properly
  const systemPrompts = {
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

IMPORTANT: Express your diagnostic reasoning process step-by-step. Show HOW you think, not just WHAT you conclude.

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

Do not reference other agents' opinions. Generate an exhaustive differential diagnosis.`
  };
  
  await testAgentWithFullPrompt("Agent-1 (Pattern Recognition)", systemPrompts.pattern);
  await testAgentWithFullPrompt("Agent-2 (Differential)", systemPrompts.differential);
}

main().catch(console.error);