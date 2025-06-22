"use client"

import React, { useState } from "react"
import Image from "next/image"
import { X, Send, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { motion, AnimatePresence } from "framer-motion"
import { useChat } from "@/contexts/chat-context"
import { AgentOpinion } from "@/types/medical"
import { ProtocolSummary } from "@/types/protocol"
import "./tentin-chat.css"

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export function TentinMedicalChat() {
  const { 
    isOpen, 
    setIsOpen, 
    sessionId, 
    agentResults, 
    summary, 
    isAnalysisComplete 
  } = useChat()
  
  // Initialize messages with a function to avoid hydration mismatch
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const now = new Date()
    const hour = now.getHours()
    const timeOfDay = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening'
    
    return [
      {
        id: '1',
        role: 'assistant',
        content: `Good ${timeOfDay}. I'm Tentin, your AI Medical Assistant.

${summary ? `I've completed a comprehensive analysis of your symptoms using our 10-agent protocol. The primary finding is **${summary.primaryDiagnosis.condition}** with ${Math.round(summary.primaryDiagnosis.confidence * 100)}% confidence.

I'm here to provide clarity and answer any questions about:
• Medical terminology and what your diagnosis means
• The significance of specific symptoms
• Recommended next steps and urgency levels
• Alternative diagnoses considered by our agents
• Evidence-based health information

Please feel free to ask detailed questions. Understanding your health condition is crucial for making informed decisions.` : 'I\'ll be available to assist you once our 10-agent analysis is complete. This comprehensive evaluation typically takes 30-45 seconds and examines your symptoms from multiple medical perspectives.'}

**⚠️ IMPORTANT MEDICAL DISCLAIMER ⚠️**
This AI-powered analysis is intended for **informational purposes only** and should not replace professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.

If you are experiencing a medical emergency, please contact your local emergency services immediately. [Find emergency numbers worldwide →](https://en.wikipedia.org/wiki/List_of_emergency_telephone_numbers)`,
        timestamp: now
      }
    ]
  })
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)

  const handleSend = async () => {
    if (!input.trim() || !summary) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput("")
    setIsTyping(true)

    // Simulate AI response
    setTimeout(() => {
      const response = generateContextualResponse(input, summary, agentResults || {})
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
    <>
      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", duration: 0.3 }}
            className="chat-window"
          >
            {/* Header */}
            <div className="chat-header">
              <div className="chat-header-info">
                <div className="chat-mascot-wrapper">
                  <Image
                    src="/tentin-mascot-sm.png"
                    alt="Tentin"
                    width={30}
                    height={30}
                    className="object-contain"
                  />
                </div>
                <div className="chat-header-text">
                  <h3>Tentin</h3>
                  <p>Medical Assistant</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Disclaimer Banner */}
            <div className="chat-disclaimer">
              <div className="chat-disclaimer-content">
                <AlertCircle className="h-3 w-3 flex-shrink-0" />
                <span>This analysis is for informational purposes only - not a substitute for professional medical care</span>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="chat-messages">
              <div className="space-y-4">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn("chat-message", message.role)}
                  >
                    <div className="chat-message-content">
                      <div className={cn("chat-avatar", message.role)}>
                        {message.role === 'user' ? (
                          <span className="text-xs font-semibold">You</span>
                        ) : (
                          <Image
                            src="/tentin-mascot-sm.png"
                            alt="Tentin"
                            width={24}
                            height={24}
                            className="object-contain"
                          />
                        )}
                      </div>
                      <div className={cn("chat-bubble", message.role)}>
                        <p>{message.content}</p>
                        <p className="chat-timestamp">
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
                    className="chat-typing"
                  >
                    <div className="chat-avatar assistant">
                      <Image
                        src="/tentin-mascot-sm.png"
                        alt="Tentin"
                        width={24}
                        height={24}
                        className="object-contain"
                      />
                    </div>
                    <div className="chat-typing-dots">
                      <div className="chat-typing-dot" />
                      <div className="chat-typing-dot" />
                      <div className="chat-typing-dot" />
                    </div>
                  </motion.div>
                )}
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="chat-input-area">
              <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="chat-input-form">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={isAnalysisComplete ? "Ask Tentin a question..." : "Waiting for analysis..."}
                  disabled={!isAnalysisComplete || isTyping}
                  className="chat-input"
                />
                <Button 
                  type="submit" 
                  disabled={!input.trim() || !isAnalysisComplete || isTyping}
                  size="icon"
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// Contextual response generator
function generateContextualResponse(
  question: string, 
  summary: ProtocolSummary, 
  agentResults: Record<string, AgentOpinion>
): string {
  const lowerQuestion = question.toLowerCase()
  
  // Always maintain professional medical tone
  const disclaimer = "\n\n⚠️ **REMINDER:** This analysis is for informational purposes only. Always seek professional medical advice for health concerns."
  
  if (lowerQuestion.includes('what is') || lowerQuestion.includes('what does') || lowerQuestion.includes('mean')) {
    return generateExplanation(question, summary) + disclaimer
  }
  
  if (lowerQuestion.includes('should i') || lowerQuestion.includes('when to') || lowerQuestion.includes('emergency')) {
    return generateActionGuidance(question, summary) + disclaimer
  }
  
  if (lowerQuestion.includes('why') || lowerQuestion.includes('how did')) {
    return generateReasoningExplanation(question, agentResults) + disclaimer
  }
  
  if (lowerQuestion.includes('symptom') || lowerQuestion.includes('pain') || lowerQuestion.includes('feeling')) {
    return generateSymptomClarification(question, summary) + disclaimer
  }
  
  // Default comprehensive response
  return `Thank you for your question about "${question}". Let me provide you with a thoughtful response based on our analysis.

Our 10-agent analysis identified **${summary.primaryDiagnosis.condition}** as the primary concern. This conclusion was reached through multiple independent medical perspectives analyzing your symptoms.

Key points from our analysis:
- **Primary finding**: ${summary.primaryDiagnosis.condition} (${Math.round(summary.primaryDiagnosis.confidence * 100)}% confidence)
- **Urgency level**: ${summary.urgencyLevel}
- **Recommended action**: ${summary.recommendedActions[0] || 'Monitor your symptoms carefully'}
${summary.redFlags.length > 0 ? `- **Warning signs to watch**: ${summary.redFlags[0]}` : ''}

Is there a specific aspect of this diagnosis or your symptoms you'd like me to explain in more detail? I'm here to help you understand your health better.${disclaimer}`
}

function generateExplanation(question: string, summary: ProtocolSummary): string {
  return `I'll explain that in clear, accessible terms:

**${summary.primaryDiagnosis.condition}** is a medical condition that typically presents with the symptoms you've described. Let me break this down:

**What it is**: [In a real implementation, this would pull from a medical knowledge base specific to the condition]

**Common characteristics**:
- **Onset**: How the condition typically develops
- **Causes**: Common triggers or underlying factors
- **Symptoms**: What patients typically experience
- **Duration**: How long it usually lasts
- **Management**: Standard treatment approaches

To help you understand better, think of it like this: [Here would be an appropriate analogy based on the specific condition]

The symptoms you're experiencing align with this diagnosis because our analysis identified patterns consistent with this condition.

Would you like me to explain any specific symptoms or medical terms in more detail? I'm here to ensure you fully understand your health situation.`
}

function generateActionGuidance(question: string, summary: ProtocolSummary): string {
  const urgencyResponse = {
    immediate: "⚠️ **IMMEDIATE MEDICAL ATTENTION REQUIRED**: This analysis suggests a potentially serious condition. If you have ANY access to emergency medical care, please seek it NOW. Call emergency services (911/112) immediately.",
    urgent: "**URGENT CARE RECOMMENDED**: This condition should be evaluated by a healthcare provider as soon as possible, ideally within 24-48 hours. Consider urgent care or emergency room if symptoms worsen.",
    moderate: "**MEDICAL CONSULTATION ADVISED**: Schedule an appointment with a healthcare provider when possible. This typically doesn't require emergency care but should be evaluated professionally.",
    low: "**ROUTINE CARE**: This can often be managed with self-care initially, but consult a healthcare provider if symptoms persist or worsen."
  }
  
  return `Based on our analysis with urgency level **${summary.urgencyLevel.toUpperCase()}**:

${urgencyResponse[summary.urgencyLevel]}

**Recommended next steps** (in order of priority):
${summary.recommendedActions.map((action, i) => `${i + 1}. ${action}`).join('\n')}

${summary.redFlags.length > 0 ? `\n⚠️ **SEEK IMMEDIATE CARE if you experience**:\n${summary.redFlags.map(flag => `- ${flag}`).join('\n')}` : ''}

**Self-care measures while awaiting medical attention**:
- Rest and stay hydrated
- Monitor and document your symptoms
- Avoid activities that worsen symptoms
- Keep a list of all medications you're taking

**Important**: These recommendations are based on AI analysis of your reported symptoms. Individual cases can vary significantly. Your specific medical history, current medications, and other factors could change these recommendations.

Do you have questions about any of these recommendations or need clarification on when to seek care?`
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
