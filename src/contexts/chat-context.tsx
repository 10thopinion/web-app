"use client"

import React, { createContext, useContext, useState, ReactNode } from 'react'
import { AgentOpinion } from '@/types/medical'
import { ProtocolSummary } from '@/types/protocol'

interface ChatContextType {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  sessionId: string | null
  setSessionId: (id: string | null) => void
  agentResults: Record<string, AgentOpinion> | null
  setAgentResults: (results: Record<string, AgentOpinion> | null) => void
  summary: ProtocolSummary | null
  setSummary: (summary: ProtocolSummary | null) => void
  isAnalysisComplete: boolean
  setIsAnalysisComplete: (complete: boolean) => void
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [agentResults, setAgentResults] = useState<Record<string, AgentOpinion> | null>(null)
  const [summary, setSummary] = useState<ProtocolSummary | null>(null)
  const [isAnalysisComplete, setIsAnalysisComplete] = useState(false)

  return (
    <ChatContext.Provider
      value={{
        isOpen,
        setIsOpen,
        sessionId,
        setSessionId,
        agentResults,
        setAgentResults,
        summary,
        setSummary,
        isAnalysisComplete,
        setIsAnalysisComplete,
      }}
    >
      {children}
    </ChatContext.Provider>
  )
}

export function useChat() {
  const context = useContext(ChatContext)
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider')
  }
  return context
}
