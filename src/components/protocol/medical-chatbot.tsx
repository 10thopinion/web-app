"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Send, AlertCircle, Bot, User, Brain, MessageSquare, HelpCircle } from "lucide-react"
import { motion } from "framer-motion"
import ReactMarkdown from "react-markdown"
import Image from "next/image"
import { AgentOpinion } from "@/types/medical"
import { ProtocolSummary } from "@/types/protocol"
import { AgentOpinionCard } from "./agent-opinion-card"

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface MedicalChatbotProps {
  sessionId: string
  agentResults: Record<string, AgentOpinion>
  summary: ProtocolSummary
}

export function MedicalChatbot({ sessionId, agentResults, summary }: MedicalChatbotProps) {
  const [selectedAgentContext, setSelectedAgentContext] = useState<AgentOpinion | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: `Welcome to **Tentin DDA** (Diagnosis Discussion Agent)! 🏥

Based on our 10-agent consensus protocol, the primary diagnosis is **${summary.primaryDiagnosis.condition}** with ${Math.round(summary.primaryDiagnosis.confidence * 100)}% confidence.

I'm here to help you understand:
- 🧠 Each agent's reasoning and perspective
- 📊 Why certain diagnoses were prioritized
- 🔍 Specific medical terms in simple language
- 🚨 What symptoms to watch for
- 📋 Recommended next steps

You can explore all 10 agent opinions in the **Agent Opinions** tab or ask me any questions here. What would you like to know more about?

**IMPORTANT:** This AI analysis is for informational purposes only. Always consult healthcare professionals for medical advice. For emergencies: [Find emergency numbers worldwide →](https://en.wikipedia.org/wiki/List_of_emergency_telephone_numbers)`,
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isTyping])

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput("")
    setIsTyping(true)

    // Simulate AI response (in production, this would call an API)
    setTimeout(() => {
      const response = generateContextualResponse(
        input, 
        summary, 
        agentResults, 
        selectedAgentContext
      )
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, assistantMessage])
      setIsTyping(false)
      // Clear agent context after using it
      setSelectedAgentContext(null)
    }, 1500)
  }

  // Handle asking about specific agent opinion
  const handleAskAboutOpinion = (opinion: AgentOpinion) => {
    setSelectedAgentContext(opinion)
    const question = `I'd like to understand more about ${opinion.agentName}'s analysis. Why did they diagnose ${opinion.diagnosis[0]} with ${Math.round(opinion.confidence * 100)}% confidence?`
    setInput(question)
    // Switch to chat tab
    const chatTab = document.querySelector('[value="chat"]') as HTMLButtonElement
    chatTab?.click()
  }

  // Sort agents by type for organized display
  const sortedAgents = Object.values(agentResults).sort((a, b) => {
    const typeOrder = { 'blind': 0, 'informed': 1, 'scrutinizer': 2, 'final': 3 }
    return (typeOrder[a.agentType as keyof typeof typeOrder] || 0) - 
           (typeOrder[b.agentType as keyof typeof typeOrder] || 0)
  })

  return (
    <Card className="min-h-[600px] max-w-6xl mx-auto flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Image
                src="/tentin-mascot-sm.png"
                alt="Tentin"
                width={28}
                height={28}
                className="object-contain"
              />
              Tentin DDA
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Diagnosis Discussion Agent</p>
          </div>
          <Badge variant="outline">Session: {sessionId.slice(-8)}</Badge>
        </div>
        <div className="flex items-center gap-2 text-sm text-orange-600 dark:text-orange-400">
          <AlertCircle className="h-4 w-4" />
          <span>This analysis is for informational purposes only - not a substitute for professional medical care</span>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0">
        <Tabs defaultValue="chat" className="flex-1 flex flex-col min-h-0">
          <TabsList className="mx-4">
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Discussion
            </TabsTrigger>
            <TabsTrigger value="opinions" className="flex items-center gap-2">
              <HelpCircle className="h-4 w-4" />
              Agent Opinions ({Object.keys(agentResults).length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="chat" className="flex flex-col h-[600px]">
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex gap-3 max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                    message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                  }`}>
                    {message.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                  </div>
                  <div className={`rounded-lg px-4 py-2 ${
                    message.role === 'user' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted'
                  }`}>
                    <div className="text-sm prose prose-sm dark:prose-invert max-w-none">
                      <ReactMarkdown 
                        components={{
                          a: ({ href, children }) => (
                            <a 
                              href={href} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              {children}
                            </a>
                          ),
                          p: ({ children }) => <p className="mb-2">{children}</p>,
                          ul: ({ children }) => <ul className="list-disc pl-4 mb-2">{children}</ul>,
                          ol: ({ children }) => <ol className="list-decimal pl-4 mb-2">{children}</ol>,
                          li: ({ children }) => <li className="mb-1">{children}</li>,
                          strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    </div>
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
            {isTyping && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-3"
              >
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="bg-muted rounded-lg px-4 py-2">
                  <div className="flex gap-1">
                    <motion.div
                      animate={{ y: [0, -5, 0] }}
                      transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
                      className="w-2 h-2 bg-muted-foreground/50 rounded-full"
                    />
                    <motion.div
                      animate={{ y: [0, -5, 0] }}
                      transition={{ repeat: Infinity, duration: 0.6, delay: 0.1 }}
                      className="w-2 h-2 bg-muted-foreground/50 rounded-full"
                    />
                    <motion.div
                      animate={{ y: [0, -5, 0] }}
                      transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
                      className="w-2 h-2 bg-muted-foreground/50 rounded-full"
                    />
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
        <div className="p-4 border-t">
          <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a follow-up question..."
              disabled={isTyping}
              className="flex-1"
            />
            <Button type="submit" disabled={!input.trim() || isTyping}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
          {selectedAgentContext && (
            <div className="mt-2 p-2 bg-muted rounded-md text-xs text-muted-foreground">
              Context: Asking about {selectedAgentContext.agentName}'s opinion
            </div>
          )}
        </div>
          </TabsContent>
          
          <TabsContent value="opinions" className="p-4">
              <div className="space-y-4">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold mb-2">All Agent Opinions</h3>
                  <p className="text-sm text-muted-foreground">
                    Click on any card to expand details or use the message button to ask specific questions about that agent's analysis.
                  </p>
                </div>
                
                {/* Group agents by type */}
                <div className="space-y-6">
                  {/* Blind Agents */}
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">Phase 1: Independent Analysis</h4>
                    <div className="space-y-3">
                      {sortedAgents
                        .filter(agent => agent.agentType === 'blind')
                        .map((agent, index) => (
                          <AgentOpinionCard
                            key={agent.agentId}
                            opinion={agent}
                            agentNumber={parseInt(agent.agentId.split('-')[1])}
                            onAskAboutOpinion={handleAskAboutOpinion}
                          />
                        ))}
                    </div>
                  </div>
                  
                  {/* Informed Agents */}
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">Phase 2: Synthesis & Analysis</h4>
                    <div className="space-y-3">
                      {sortedAgents
                        .filter(agent => agent.agentType === 'informed')
                        .map((agent, index) => (
                          <AgentOpinionCard
                            key={agent.agentId}
                            opinion={agent}
                            agentNumber={parseInt(agent.agentId.split('-')[1])}
                            onAskAboutOpinion={handleAskAboutOpinion}
                          />
                        ))}
                    </div>
                  </div>
                  
                  {/* Scrutinizers */}
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">Phase 3: Quality Control</h4>
                    <div className="space-y-3">
                      {sortedAgents
                        .filter(agent => agent.agentType === 'scrutinizer')
                        .map((agent, index) => (
                          <AgentOpinionCard
                            key={agent.agentId}
                            opinion={agent}
                            agentNumber={parseInt(agent.agentId.split('-')[1])}
                            onAskAboutOpinion={handleAskAboutOpinion}
                          />
                        ))}
                    </div>
                  </div>
                  
                  {/* Final Authority */}
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">Phase 4: Final Synthesis</h4>
                    <div className="space-y-3">
                      {sortedAgents
                        .filter(agent => agent.agentType === 'final')
                        .map((agent, index) => (
                          <AgentOpinionCard
                            key={agent.agentId}
                            opinion={agent}
                            agentNumber={parseInt(agent.agentId.split('-')[1])}
                            onAskAboutOpinion={handleAskAboutOpinion}
                          />
                        ))}
                    </div>
                  </div>
                </div>
              </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

// Contextual response generator (enhanced version)
function generateContextualResponse(
  question: string, 
  summary: ProtocolSummary, 
  agentResults: Record<string, AgentOpinion>,
  selectedAgent?: AgentOpinion | null
): string {
  const lowerQuestion = question.toLowerCase()
  
  // Check for common question patterns
  if (lowerQuestion.includes('what is') || lowerQuestion.includes('what does') || lowerQuestion.includes('mean')) {
    return generateExplanation(question, summary)
  }
  
  if (lowerQuestion.includes('should i') || lowerQuestion.includes('when to') || lowerQuestion.includes('emergency')) {
    return generateActionGuidance(question, summary)
  }
  
  if (lowerQuestion.includes('why') || lowerQuestion.includes('how did')) {
    return generateReasoningExplanation(question, agentResults, selectedAgent)
  }
  
  // Handle agent-specific questions
  if (selectedAgent) {
    return generateAgentSpecificResponse(question, selectedAgent, summary, agentResults)
  }
  
  if (lowerQuestion.includes('symptom') || lowerQuestion.includes('pain') || lowerQuestion.includes('feeling')) {
    return generateSymptomClarification(question, summary)
  }
  
  // Default response
  return `I understand you're asking about "${question}". Based on our analysis:

${summary.primaryDiagnosis.condition} was identified as the most likely diagnosis because multiple agents noted similar patterns in your symptoms.

Key points to remember:
- ${summary.recommendedActions[0] || 'Monitor your symptoms'}
- ${summary.redFlags.length > 0 ? `Watch for: ${summary.redFlags[0]}` : 'Continue observing any changes'}

Is there a specific aspect of this diagnosis or your symptoms you'd like me to explain further?

**REMINDER:** This analysis is for informational purposes only. Always seek professional medical advice for health concerns.`
}

function generateExplanation(question: string, summary: ProtocolSummary): string {
  return `Let me explain that in simple terms:

${summary.primaryDiagnosis.condition} is a condition that typically involves the symptoms you've described. In medical terms, it means [simplified explanation would go here based on the specific condition].

Common characteristics include:
- How it develops: Usually gradual/sudden onset
- What causes it: Various factors including...
- How it's typically managed: Rest, medication, lifestyle changes

Think of it like [everyday analogy to help understanding].

Would you like me to explain any specific symptoms or medical terms?

**DISCLAIMER:** This analysis is provided for informational purposes only and is not a substitute for professional medical advice.`
}

function generateActionGuidance(question: string, summary: ProtocolSummary): string {
  const urgencyResponse = {
    immediate: "This requires immediate medical attention. If you have ANY access to medical care, seek it now.",
    urgent: "This should be evaluated by a healthcare provider soon, ideally within 24-48 hours.",
    moderate: "Schedule an appointment with a healthcare provider when possible.",
    low: "This can typically be managed with self-care, but see a doctor if symptoms worsen."
  }
  
  return `Based on the urgency level (${summary.urgencyLevel}):

${urgencyResponse[summary.urgencyLevel]}

Recommended next steps:
${summary.recommendedActions.map((action, i) => `${i + 1}. ${action}`).join('\n')}

${summary.redFlags.length > 0 ? `\nSeek immediate care if you experience:\n${summary.redFlags.map(flag => `- ${flag}`).join('\n')}` : ''}

Remember: These are general guidelines. Your specific situation may require different actions.

**IMPORTANT:** This information is educational only. For medical emergencies or health concerns, consult qualified healthcare providers. [Emergency numbers worldwide →](https://en.wikipedia.org/wiki/List_of_emergency_telephone_numbers)`
}

function generateReasoningExplanation(
  question: string, 
  agentResults: Record<string, AgentOpinion>,
  selectedAgent?: AgentOpinion | null
): string {
  // If asking about a specific agent
  if (selectedAgent) {
    return `## ${selectedAgent.agentName}'s Analysis

**Specialization**: ${selectedAgent.specialization}
**Confidence**: ${Math.round(selectedAgent.confidence * 100)}%

### Diagnostic Reasoning:
${selectedAgent.reasoning}

### Key Factors:
- **Agent Type**: ${selectedAgent.agentType} (${
  selectedAgent.agentType === 'blind' ? 'Independent analysis without seeing other opinions' :
  selectedAgent.agentType === 'informed' ? 'Built upon previous agents\' findings' :
  selectedAgent.agentType === 'scrutinizer' ? 'Quality control and bias detection' :
  'Final synthesis of all opinions'
})
- **Primary Diagnosis**: ${selectedAgent.diagnosis[0]}
${selectedAgent.diagnosis.length > 1 ? `- **Alternative Diagnoses**: ${selectedAgent.diagnosis.slice(1).join(', ')}` : ''}

${selectedAgent.redFlags && selectedAgent.redFlags.length > 0 ? `### Red Flags Identified:
${selectedAgent.redFlags.map(flag => `- ${flag}`).join('\\n')}` : ''}

This agent's unique perspective contributes to our comprehensive analysis by ${
  selectedAgent.specialization === 'Pattern Recognition' ? 'identifying common symptom patterns' :
  selectedAgent.specialization === 'Differential Diagnosis' ? 'considering all possible conditions' :
  selectedAgent.specialization === 'Rare Disease Specialist' ? 'checking for uncommon conditions others might miss' :
  selectedAgent.specialization === 'Consensus Builder' ? 'synthesizing multiple perspectives' :
  'providing specialized insight'
}.

**REMINDER:** This is one perspective in our 10-agent consensus system. The final diagnosis considers all agents' inputs.`;
  }
  
  // Original logic for general reasoning questions
  const topAgents = Object.values(agentResults)
    .filter(a => a.confidence > 0.7)
    .slice(0, 3)
  
  return `Our diagnosis was reached through multiple expert perspectives:

${topAgents.map(agent => `• ${agent.agentName} (${agent.specialization}): Noted ${agent.reasoning.slice(0, 100)}...`).join('\n\n')}

The key factors that led to this conclusion:
1. Pattern of symptoms matching typical presentation
2. Consistency across multiple diagnostic approaches
3. Evidence-based medical guidelines support

Our confidence level reflects the agreement between different analytical approaches.

**REMINDER:** This is an AI-generated analysis for informational purposes. Always consult healthcare professionals for medical advice.`
}

function generateSymptomClarification(question: string, summary: ProtocolSummary): string {
  return `Regarding your symptom question:

This symptom is commonly associated with ${summary.primaryDiagnosis.condition}. Here's what you should know:

- **What it means**: This symptom typically indicates...
- **Why it happens**: The underlying mechanism involves...
- **What to monitor**: Pay attention to changes in intensity, frequency, or character
- **When to worry**: If it becomes severe, persistent, or is accompanied by ${summary.redFlags[0] || 'other concerning symptoms'}

Self-care tips while monitoring:
- Rest and avoid triggers
- Stay hydrated
- Track symptom patterns
- Note what makes it better or worse

**IMPORTANT:** This analysis is for educational purposes only. Always consult with qualified healthcare professionals for medical advice. Any worsening or new symptoms should prompt you to seek available medical care.`
}

function generateAgentSpecificResponse(
  question: string,
  selectedAgent: AgentOpinion,
  summary: ProtocolSummary,
  allAgents: Record<string, AgentOpinion>
): string {
  const lowerQuestion = question.toLowerCase()
  
  // Compare with other agents
  if (lowerQuestion.includes('compare') || lowerQuestion.includes('different') || lowerQuestion.includes('disagree')) {
    const otherAgents = Object.values(allAgents).filter(a => a.agentId !== selectedAgent.agentId)
    const agreementAgents = otherAgents.filter(a => 
      a.diagnosis.some(d => selectedAgent.diagnosis.includes(d))
    )
    const disagreementAgents = otherAgents.filter(a => 
      !a.diagnosis.some(d => selectedAgent.diagnosis.includes(d))
    )
    
    return `## Comparing ${selectedAgent.agentName} with Other Agents

### Agreement Analysis:
- **${agreementAgents.length} agents** share similar diagnoses
- **${disagreementAgents.length} agents** have different perspectives

### ${selectedAgent.agentName}'s Unique Contribution:
${selectedAgent.reasoning}

### How This Compares:
${agreementAgents.length > 0 ? `
**Agents in Agreement:**
${agreementAgents.slice(0, 3).map(a => `- ${a.agentName}: ${a.diagnosis[0]} (${Math.round(a.confidence * 100)}%)`).join('\\n')}
` : ''}

${disagreementAgents.length > 0 ? `
**Different Perspectives:**
${disagreementAgents.slice(0, 3).map(a => `- ${a.agentName}: ${a.diagnosis[0]} (${Math.round(a.confidence * 100)}%)`).join('\\n')}
` : ''}

### Why These Differences Matter:
Different agents use different diagnostic approaches, which helps ensure we don't miss important possibilities. ${selectedAgent.agentName}'s ${selectedAgent.specialization} approach specifically helps by ${
  selectedAgent.agentType === 'blind' ? 'providing an unbiased initial assessment' :
  selectedAgent.agentType === 'informed' ? 'building on and validating earlier findings' :
  selectedAgent.agentType === 'scrutinizer' ? 'checking for errors and biases' :
  'synthesizing all perspectives into a final recommendation'
}.

**REMINDER:** Multiple perspectives strengthen our analysis. Disagreement between agents is valuable as it highlights areas needing careful consideration.`;
  }
  
  // Explain confidence level
  if (lowerQuestion.includes('confidence') || lowerQuestion.includes('sure') || lowerQuestion.includes('certain')) {
    return `## Understanding ${selectedAgent.agentName}'s Confidence Level

**Confidence**: ${Math.round(selectedAgent.confidence * 100)}%

### What This Means:
${
  selectedAgent.confidence >= 0.8 ? 'This agent has **high confidence** in their diagnosis, indicating:' :
  selectedAgent.confidence >= 0.6 ? 'This agent has **moderate confidence** in their diagnosis, suggesting:' :
  'This agent has **lower confidence** in their diagnosis, which means:'
}

${
  selectedAgent.confidence >= 0.8 ? 
  `- Strong pattern match with typical presentations
- Clear symptom constellation
- Consistent with medical literature
- Few alternative explanations` :
  selectedAgent.confidence >= 0.6 ?
  `- Good symptom match but some uncertainty
- Multiple possible explanations
- Need for additional information
- Some atypical features` :
  `- Unclear symptom pattern
- Many possible diagnoses
- Significant uncertainty
- Need for further evaluation`
}

### Factors Affecting Confidence:
1. **Symptom Clarity**: How well symptoms match known patterns
2. **Information Completeness**: Whether key diagnostic information is available
3. **Differential Complexity**: Number of conditions with similar presentations
4. **${selectedAgent.specialization}**: This agent's specific expertise area

${selectedAgent.redFlags && selectedAgent.redFlags.length > 0 ? `
### Concerns Affecting Confidence:
${selectedAgent.redFlags.map(flag => `- ${flag}`).join('\\n')}
` : ''}

**NOTE:** Confidence levels help prioritize diagnoses but don't guarantee accuracy. Even high-confidence diagnoses require professional medical validation.`;
  }
  
  // Default agent-specific response
  return `## Deep Dive: ${selectedAgent.agentName}

### About This Agent:
- **Role**: ${selectedAgent.specialization}
- **Phase**: ${
  selectedAgent.agentType === 'blind' ? 'Phase 1 - Independent Analysis' :
  selectedAgent.agentType === 'informed' ? 'Phase 2 - Synthesis & Validation' :
  selectedAgent.agentType === 'scrutinizer' ? 'Phase 3 - Quality Control' :
  'Phase 4 - Final Authority'
}
- **Approach**: ${
  selectedAgent.agentId === 'agent-1' ? 'Pattern recognition and common presentations' :
  selectedAgent.agentId === 'agent-2' ? 'Comprehensive differential diagnosis' :
  selectedAgent.agentId === 'agent-3' ? 'Rare disease consideration' :
  selectedAgent.agentId === 'agent-4' ? 'Holistic patient assessment' :
  selectedAgent.agentId === 'agent-5' ? 'Building consensus from multiple opinions' :
  selectedAgent.agentId === 'agent-6' ? 'Challenging assumptions and finding gaps' :
  selectedAgent.agentId === 'agent-7' ? 'Validating against medical evidence' :
  selectedAgent.agentId === 'agent-8' ? 'Detecting diagnostic errors' :
  selectedAgent.agentId === 'agent-9' ? 'Checking for biases' :
  'Synthesizing all perspectives'
}

### Key Findings:
- **Primary Diagnosis**: ${selectedAgent.diagnosis[0]}
- **Confidence**: ${Math.round(selectedAgent.confidence * 100)}%
${selectedAgent.diagnosis.length > 1 ? `- **Alternatives Considered**: ${selectedAgent.diagnosis.slice(1).join(', ')}` : ''}

### Detailed Reasoning:
${selectedAgent.reasoning}

${selectedAgent.recommendations && selectedAgent.recommendations.length > 0 ? `
### Specific Recommendations:
${selectedAgent.recommendations.map((rec, i) => `${i + 1}. ${rec}`).join('\\n')}
` : ''}

### How This Fits the Overall Picture:
This agent's analysis ${
  summary.primaryDiagnosis.condition === selectedAgent.diagnosis[0] ? 
  'aligns with the final consensus' : 
  'provides an important alternative perspective'
}, contributing to a ${Math.round(summary.consensus * 100)}% overall consensus among agents.

**Would you like to:**
- Compare this with other agents' opinions?
- Understand why this agent reached this conclusion?
- Learn more about the diagnosed condition?

**REMINDER:** This is one perspective in our comprehensive analysis. Always consult healthcare professionals for medical decisions.`;
}
