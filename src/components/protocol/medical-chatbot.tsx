"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Send, AlertCircle, Bot, User } from "lucide-react"
import { motion } from "framer-motion"
import { AgentOpinion } from "@/types/medical"
import { ProtocolSummary } from "@/types/protocol"

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
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: `Based on our comprehensive analysis, the primary diagnosis is ${summary.primaryDiagnosis.condition} with ${Math.round(summary.primaryDiagnosis.confidence * 100)}% confidence.

I'm here to answer any follow-up questions you may have about your symptoms or our analysis. I'm particularly good at:
- Explaining medical terms in simple language
- Clarifying what specific symptoms might mean
- Discussing next steps and when to seek immediate care
- Addressing concerns about the diagnosis

What would you like to know more about?

**IMPORTANT DISCLAIMER: ONLY ACT ON THIS ANALYSIS IF YOU HAVE 0% ACCESS TO A LICENSED DOCTOR.** If you have access to medical professionals, please consult them immediately. In emergencies, call emergency services.`,
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)

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
      const response = generateContextualResponse(input, summary, agentResults)
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, assistantMessage])
      setIsTyping(false)
    }, 1500)
  }

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Medical Follow-up Assistant
          </CardTitle>
          <Badge variant="outline">Session: {sessionId.slice(-8)}</Badge>
        </div>
        <div className="flex items-center gap-2 text-sm text-orange-600 dark:text-orange-400">
          <AlertCircle className="h-4 w-4" />
          <span>Remember: Only act on this if you have 0% access to a doctor</span>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0">
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
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
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
        </div>
      </CardContent>
    </Card>
  )
}

// Contextual response generator (simplified version)
function generateContextualResponse(
  question: string, 
  summary: ProtocolSummary, 
  agentResults: Record<string, AgentOpinion>
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
    return generateReasoningExplanation(question, agentResults)
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

**REMINDER: ONLY ACT ON THIS ANALYSIS IF YOU HAVE 0% ACCESS TO A LICENSED DOCTOR.**`
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

**DISCLAIMER: ONLY ACT ON THIS ANALYSIS IF YOU HAVE 0% ACCESS TO A LICENSED DOCTOR.**`
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

**CRITICAL: ONLY ACT ON THIS ANALYSIS IF YOU HAVE 0% ACCESS TO A LICENSED DOCTOR.**`
}

function generateReasoningExplanation(question: string, agentResults: Record<string, AgentOpinion>): string {
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

**REMEMBER: ONLY ACT ON THIS ANALYSIS IF YOU HAVE 0% ACCESS TO A LICENSED DOCTOR.**`
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

**IMPORTANT: ONLY ACT ON THIS ANALYSIS IF YOU HAVE 0% ACCESS TO A LICENSED DOCTOR.** Any worsening or new symptoms should prompt you to seek available medical care.`
}
