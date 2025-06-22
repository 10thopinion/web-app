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
import ReactMarkdown from "react-markdown"
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

I'm here to help answer your medical questions and provide health information. I can assist with:
• Understanding symptoms and their potential causes
• Explaining medical terminology in simple terms
• Providing general health and wellness guidance
• Discussing when to seek medical care
• Answering follow-up questions about health concerns

Feel free to ask me anything about your health. I'm designed to provide clear, evidence-based information to help you make informed decisions.

**⚠️ IMPORTANT MEDICAL DISCLAIMER ⚠️**
This AI-powered assistance is intended for **informational purposes only** and should not replace professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.

If you are experiencing a medical emergency, please contact your local emergency services immediately. [Find emergency numbers worldwide →](https://en.wikipedia.org/wiki/List_of_emergency_telephone_numbers)`,
        timestamp: now
      }
    ]
  })
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

    // Simulate AI response
    setTimeout(() => {
      const response = generateGeneralMedicalResponse(input, summary, agentResults || {})
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
                        <div className="text-sm whitespace-pre-wrap prose prose-sm dark:prose-invert max-w-none">
                          <ReactMarkdown 
                            components={{
                              p: ({ children }) => <p className="mb-2">{children}</p>,
                              strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                              ul: ({ children }) => <ul className="list-disc pl-4 mb-2">{children}</ul>,
                              li: ({ children }) => <li className="mb-1">{children}</li>,
                              a: ({ href, children }) => (
                                <a 
                                  href={href} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="text-blue-500 hover:underline"
                                >
                                  {children}
                                </a>
                              )
                            }}
                          >
                            {message.content}
                          </ReactMarkdown>
                        </div>
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
                  placeholder="Ask Tentin a medical question..."
                  disabled={isTyping}
                  className="chat-input"
                />
                <Button 
                  type="submit" 
                  disabled={!input.trim() || isTyping}
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

// General medical response generator
function generateGeneralMedicalResponse(
  question: string, 
  summary: ProtocolSummary | null, 
  agentResults: Record<string, AgentOpinion>
): string {
  const lowerQuestion = question.toLowerCase()
  
  // Always maintain professional medical tone
  const disclaimer = "\n\n⚠️ **REMINDER:** This information is for educational purposes only. Always seek professional medical advice for health concerns."
  
  // If we have analysis results, include them in context
  if (summary) {
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
    
    // Default response with analysis context
    return `Thank you for your question about "${question}". Let me provide you with a thoughtful response based on our analysis.

Our 10-agent analysis identified **${summary.primaryDiagnosis.condition}** as the primary concern. This conclusion was reached through multiple independent medical perspectives analyzing your symptoms.

Key points from our analysis:
- **Primary finding**: ${summary.primaryDiagnosis.condition} (${Math.round(summary.primaryDiagnosis.confidence * 100)}% confidence)
- **Urgency level**: ${summary.urgencyLevel}
- **Recommended action**: ${summary.recommendedActions[0] || 'Monitor your symptoms carefully'}
${summary.redFlags.length > 0 ? `- **Warning signs to watch**: ${summary.redFlags[0]}` : ''}

Is there a specific aspect of this diagnosis or your symptoms you'd like me to explain in more detail? I'm here to help you understand your health better.${disclaimer}`
  }
  
  // General medical responses without analysis context
  if (lowerQuestion.includes('symptom') || lowerQuestion.includes('pain') || lowerQuestion.includes('feeling')) {
    return generateGeneralSymptomResponse(question) + disclaimer
  }
  
  if (lowerQuestion.includes('should i') || lowerQuestion.includes('when to') || lowerQuestion.includes('emergency')) {
    return generateGeneralActionGuidance(question) + disclaimer
  }
  
  if (lowerQuestion.includes('what is') || lowerQuestion.includes('what does') || lowerQuestion.includes('mean')) {
    return generateGeneralExplanation(question) + disclaimer
  }
  
  // Default general response
  return `Thank you for your question: "${question}"

I'm here to help you understand health-related topics. While I can provide general medical information, I recommend using our 10-agent analysis system for a comprehensive evaluation of specific symptoms.

For your question, here are some general considerations:
- If you're experiencing symptoms, it's important to monitor their severity and duration
- Keep track of any changes or new symptoms that develop
- Consider factors like your medical history and current medications
- Don't hesitate to seek professional medical care if symptoms persist or worsen

Would you like to:
1. Start a comprehensive 10-agent analysis of your symptoms?
2. Ask more specific questions about health topics?
3. Learn about when to seek medical care?

I'm here to provide helpful health information to support your wellbeing.${disclaimer}`
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

// General response functions that work without analysis context
function generateGeneralSymptomResponse(question: string): string {
  return `I understand you have a question about symptoms: "${question}"

When evaluating symptoms, consider these general factors:

**Important considerations:**
- **Duration**: How long have you experienced this symptom?
- **Severity**: Rate the intensity on a scale of 1-10
- **Pattern**: Is it constant, intermittent, or triggered by specific activities?
- **Associated symptoms**: Are there other symptoms occurring alongside?

**General guidance:**
- Keep a symptom diary noting time, triggers, and severity
- Monitor for any worsening or new symptoms
- Stay hydrated and get adequate rest
- Avoid known triggers if you've identified any

**When to seek care:**
- Severe or sudden onset symptoms
- Symptoms lasting more than a few days without improvement
- Fever above 103°F (39.4°C)
- Difficulty breathing, chest pain, or severe headache
- Any symptom that concerns you

For a comprehensive evaluation of your specific symptoms, consider using our 10-agent analysis system for detailed insights.`
}

function generateGeneralActionGuidance(question: string): string {
  return `Regarding your question about medical actions: "${question}"

**General medical decision-making guidance:**

**For non-emergency situations:**
1. **Primary care**: Schedule with your regular doctor for ongoing issues
2. **Urgent care**: For same-day needs that aren't emergencies
3. **Telemedicine**: Convenient for minor issues and follow-ups
4. **Walk-in clinics**: For basic care without appointments

**Emergency situations - Call 911 or go to ER if you experience:**
- Chest pain or pressure
- Difficulty breathing
- Severe bleeding
- Loss of consciousness
- Sudden confusion or difficulty speaking
- Severe allergic reactions

**Self-care considerations:**
- Rest and hydration for minor illnesses
- Over-the-counter medications as directed
- Monitor symptoms and keep records
- Follow up if symptoms persist or worsen

**Making healthcare decisions:**
- Consider symptom severity and duration
- Factor in your medical history
- Don't delay care for concerning symptoms
- When in doubt, seek professional advice

For personalized recommendations based on your specific symptoms, our 10-agent analysis can provide detailed guidance.`
}

function generateGeneralExplanation(question: string): string {
  return `Let me help explain that medical concept: "${question}"

**Understanding medical terms and conditions:**

Medical terminology can be complex, but understanding key concepts helps you:
- Communicate effectively with healthcare providers
- Make informed health decisions
- Better understand your body and health

**Common medical term components:**
- **-itis**: Inflammation (e.g., bronchitis = inflammation of bronchi)
- **-emia**: Blood condition (e.g., anemia = low red blood cells)
- **-pathy**: Disease (e.g., neuropathy = nerve disease)
- **Hyper-**: Excessive (e.g., hypertension = high blood pressure)
- **Hypo-**: Deficient (e.g., hypothyroid = underactive thyroid)

**Tips for understanding medical information:**
1. Ask your doctor to explain in simple terms
2. Request written information or reliable resources
3. Don't hesitate to ask questions
4. Keep a list of medical terms to research

**Finding reliable health information:**
- Government health websites (CDC, NIH)
- Major medical institutions
- Peer-reviewed medical journals
- Your healthcare provider's resources

Would you like me to explain a specific medical term or condition in more detail? I'm here to help make medical information more accessible.`
}
