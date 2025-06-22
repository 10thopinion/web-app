import { useState, useEffect } from "react"
import { PatientData, AgentOpinion } from "@/types/medical"
import { TenthOpinionProtocol } from "@/types/protocol"
import { AGENT_CONFIGS } from "@/types/protocol"
import { useChat } from "@/contexts/chat-context"

interface UseProtocolAnalysisProps {
  patientData: PatientData
  onComplete?: (protocol: TenthOpinionProtocol) => void
  useMockData?: boolean // For demo purposes
}

export function useProtocolAnalysis({ 
  patientData, 
  onComplete,
  useMockData = true // Default to mock for demo
}: UseProtocolAnalysisProps) {
  const { setSessionId, setAgentResults, setSummary, setIsAnalysisComplete } = useChat()
  
  const [protocol, setProtocol] = useState<TenthOpinionProtocol>({
    sessionId: Math.random().toString(36).substr(2, 9),
    patientData,
    agents: {
      blindAgents: [],
      informedAgents: [],
      scrutinizers: [],
    },
    startTime: new Date(),
    status: "initializing"
  })
  
  const [agentStatuses, setAgentStatuses] = useState<Record<string, "waiting" | "thinking" | "complete">>({})
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Initialize agent statuses
    const allAgents = [
      ...AGENT_CONFIGS.blind,
      ...AGENT_CONFIGS.informed,
      ...AGENT_CONFIGS.scrutinizers,
      AGENT_CONFIGS.final
    ]
    const initialStatuses: Record<string, "waiting" | "thinking" | "complete"> = {}
    allAgents.forEach(agent => {
      initialStatuses[agent.id] = "waiting"
    })
    setAgentStatuses(initialStatuses)
    
    // Start the protocol
    if (useMockData) {
      runMockProtocol()
    } else {
      runRealProtocol()
    }
  }, [])

  const runRealProtocol = async () => {
    try {
      setProtocol(prev => ({ ...prev, status: "collecting" }))
      
      // Simulate agent processing visually while API call is made
      simulateAgentProgress()
      
      // Make API call
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(patientData),
      })

      if (!response.ok) {
        throw new Error('Analysis failed')
      }

      const data = await response.json()
      
      // Process results and update protocol
      processApiResults(data.results)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setProtocol(prev => ({ ...prev, status: "error" }))
    }
  }

  const simulateAgentProgress = () => {
    // Visual simulation of agents thinking
    const allAgents = [
      ...AGENT_CONFIGS.blind,
      ...AGENT_CONFIGS.informed,
      ...AGENT_CONFIGS.scrutinizers,
      AGENT_CONFIGS.final
    ]
    
    // Blind agents start immediately
    AGENT_CONFIGS.blind.forEach((agent, index) => {
      setTimeout(() => {
        setAgentStatuses(prev => ({ ...prev, [agent.id]: "thinking" }))
      }, index * 500)
    })

    // Informed agents start after blind
    let delay = AGENT_CONFIGS.blind.length * 500 + 2000
    AGENT_CONFIGS.informed.forEach((agent) => {
      setTimeout(() => {
        setAgentStatuses(prev => ({ ...prev, [agent.id]: "thinking" }))
      }, delay)
      delay += 2000
    })

    // Scrutinizers
    AGENT_CONFIGS.scrutinizers.forEach((agent, index) => {
      setTimeout(() => {
        setAgentStatuses(prev => ({ ...prev, [agent.id]: "thinking" }))
      }, delay + index * 500)
    })

    // Final
    setTimeout(() => {
      setAgentStatuses(prev => ({ ...prev, [AGENT_CONFIGS.final.id]: "thinking" }))
    }, delay + 2000)
  }

  const processApiResults = (results: Record<string, AgentOpinion>) => {
    // Group results by agent type
    const blindAgents = AGENT_CONFIGS.blind.map(config => results[config.id]).filter(Boolean)
    const informedAgents = AGENT_CONFIGS.informed.map(config => results[config.id]).filter(Boolean)
    const scrutinizers = AGENT_CONFIGS.scrutinizers.map(config => results[config.id]).filter(Boolean)
    const finalAuthority = results[AGENT_CONFIGS.final.id]

    const summary = generateSummary(blindAgents, informedAgents, scrutinizers, finalAuthority)

    // Update protocol with results
    setProtocol(prev => ({
      ...prev,
      agents: {
        blindAgents,
        informedAgents,
        scrutinizers,
        finalAuthority
      },
      summary,
      endTime: new Date(),
      status: "complete"
    }))

    // Update all agent statuses to complete
    const completeStatuses: Record<string, "complete"> = {}
    Object.keys(results).forEach(agentId => {
      completeStatuses[agentId] = "complete"
    })
    setAgentStatuses(prev => ({ ...prev, ...completeStatuses }))

    // Update chat context
    setSessionId(protocol.sessionId)
    setAgentResults(results)
    setSummary(summary)
    setIsAnalysisComplete(true)
  }

  const runMockProtocol = async () => {
    setProtocol(prev => ({ ...prev, status: "collecting" }))
    
    // Simulate blind agents (1-4) analyzing in parallel
    const blindPromises = AGENT_CONFIGS.blind.map((agent, index) => 
      simulateMockAgent(agent, index * 0.5, "blind")
    )
    
    const blindResults = await Promise.all(blindPromises)
    setProtocol(prev => ({
      ...prev,
      agents: { ...prev.agents, blindAgents: blindResults }
    }))
    
    // Simulate informed agents (5-7) analyzing sequentially
    const informedResults: AgentOpinion[] = []
    for (let i = 0; i < AGENT_CONFIGS.informed.length; i++) {
      const agent = AGENT_CONFIGS.informed[i]
      const result = await simulateMockAgent(agent, 0.5, "informed")
      informedResults.push(result)
      setProtocol(prev => ({
        ...prev,
        agents: { ...prev.agents, informedAgents: [...prev.agents.informedAgents, result] }
      }))
    }
    
    // Simulate scrutinizers (8-9) in parallel
    setProtocol(prev => ({ ...prev, status: "analyzing" }))
    const scrutinizerPromises = AGENT_CONFIGS.scrutinizers.map((agent, index) => 
      simulateMockAgent(agent, index * 0.5, "scrutinizer")
    )
    
    const scrutinizerResults = await Promise.all(scrutinizerPromises)
    setProtocol(prev => ({
      ...prev,
      agents: { ...prev.agents, scrutinizers: scrutinizerResults }
    }))
    
    // Final authority (10)
    const finalResult = await simulateMockAgent(AGENT_CONFIGS.final, 0.5, "final")
    setProtocol(prev => ({
      ...prev,
      agents: { ...prev.agents, finalAuthority: finalResult }
    }))
    
    // Generate summary
    const summary = generateSummary(blindResults, informedResults, scrutinizerResults, finalResult)
    
    // Create agent results map
    const allAgentResults: Record<string, AgentOpinion> = {}
    blindResults.forEach(agent => { allAgentResults[agent.agentId] = agent })
    informedResults.forEach(agent => { allAgentResults[agent.agentId] = agent })
    scrutinizerResults.forEach(agent => { allAgentResults[agent.agentId] = agent })
    allAgentResults[finalResult.agentId] = finalResult
    
    // Update chat context
    setSessionId(protocol.sessionId)
    setAgentResults(allAgentResults)
    setSummary(summary)
    setIsAnalysisComplete(true)
    
    const finalProtocol = {
      ...protocol,
      agents: {
        blindAgents: blindResults,
        informedAgents: informedResults,
        scrutinizers: scrutinizerResults,
        finalAuthority: finalResult
      },
      summary,
      endTime: new Date(),
      status: "complete" as const
    }
    
    setProtocol(finalProtocol)
    onComplete?.(finalProtocol)
  }

  const simulateMockAgent = async (
    agentConfig: any, 
    delay: number, 
    agentType: AgentOpinion["agentType"]
  ): Promise<AgentOpinion> => {
    // Set status to thinking
    await new Promise(resolve => setTimeout(resolve, delay * 1000))
    setAgentStatuses(prev => ({ ...prev, [agentConfig.id]: "thinking" }))
    
    // Simulate thinking time
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 2000))
    
    // Generate mock diagnosis based on symptoms
    const mockDiagnoses = getMockDiagnosis(patientData.symptoms)
    
    const result: AgentOpinion = {
      agentId: agentConfig.id,
      agentName: agentConfig.name,
      agentType,
      specialization: agentConfig.specialization,
      diagnosis: mockDiagnoses[Math.floor(Math.random() * mockDiagnoses.length)],
      confidence: 0.7 + Math.random() * 0.25,
      reasoning: `Based on the symptoms of ${patientData.symptoms.join(", ")}, ${agentConfig.approach.toLowerCase()}`,
      redFlags: Math.random() > 0.7 ? ["Monitor for fever above 103°F", "Seek care if symptoms worsen"] : undefined,
      recommendations: getRecommendations(agentType),
      timestamp: new Date(),
      model: agentConfig.model
    }
    
    setAgentStatuses(prev => ({ ...prev, [agentConfig.id]: "complete" }))
    return result
  }

  const getMockDiagnosis = (symptoms: string[]): string[][] => {
    // Simple symptom-based mock diagnoses
    const symptomLower = symptoms.map(s => s.toLowerCase()).join(" ")
    
    if (symptomLower.includes("headache") || symptomLower.includes("fever")) {
      return [
        ["Viral upper respiratory infection", "Common cold"],
        ["Influenza", "Seasonal flu"],
        ["Tension headache", "Stress-related"],
        ["Sinusitis", "Sinus infection"]
      ]
    } else if (symptomLower.includes("chest") || symptomLower.includes("cough")) {
      return [
        ["Bronchitis", "Chest infection"],
        ["Viral pneumonia", "Lung infection"],
        ["Asthma exacerbation", "Respiratory condition"],
        ["GERD", "Acid reflux"]
      ]
    } else {
      return [
        ["Viral syndrome", "Non-specific viral illness"],
        ["Fatigue syndrome", "General malaise"],
        ["Stress-related symptoms", "Anxiety manifestation"],
        ["Requires further evaluation", "Insufficient data"]
      ]
    }
  }

  const getRecommendations = (agentType: AgentOpinion["agentType"]): string[] => {
    switch (agentType) {
      case "blind":
        return ["Rest and hydration", "Monitor symptoms", "Over-the-counter symptom relief"]
      case "informed":
        return ["Follow up with primary care", "Keep symptom diary", "Consider diagnostic tests"]
      case "scrutinizer":
        return ["Review medications for interactions", "Ensure equitable care access"]
      case "final":
        return ["Schedule appointment within 48 hours", "Begin symptomatic treatment", "Return if symptoms worsen"]
      default:
        return ["Seek medical evaluation"]
    }
  }

  const generateSummary = (
    blind: AgentOpinion[], 
    informed: AgentOpinion[], 
    scrutinizers: AgentOpinion[], 
    final: AgentOpinion
  ): TenthOpinionProtocol["summary"] => {
    // Count diagnosis frequencies
    const diagnosisCounts = new Map<string, number>()
    const allDiagnoses = [...blind, ...informed].flatMap(a => a.diagnosis)
    allDiagnoses.forEach(diag => {
      diagnosisCounts.set(diag, (diagnosisCounts.get(diag) || 0) + 1)
    })

    // Sort by frequency
    const sortedDiagnoses = Array.from(diagnosisCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([diagnosis]) => diagnosis)

    return {
      primaryDiagnosis: {
        condition: final.diagnosis[0] || sortedDiagnoses[0] || "Requires further evaluation",
        confidence: final.confidence,
        icd10Code: getICD10Code(final.diagnosis[0])
      },
      alternativeDiagnoses: sortedDiagnoses.slice(1, 4).map(condition => ({
        condition,
        confidence: 0.5 + Math.random() * 0.3,
        icd10Code: getICD10Code(condition)
      })),
      urgencyLevel: determineUrgency(blind, informed, scrutinizers, final),
      redFlags: [...new Set([...blind, ...informed, ...scrutinizers, final]
        .flatMap(a => a.redFlags || []))],
      recommendedActions: final.recommendations || [],
      consensus: calculateConsensus(blind, informed, final)
    }
  }

  const getICD10Code = (condition: string): string => {
    const icdMap: Record<string, string> = {
      "Viral upper respiratory infection": "J06.9",
      "Common cold": "J00",
      "Influenza": "J11.1",
      "Tension headache": "G44.2",
      "Sinusitis": "J32.9",
      "Bronchitis": "J20.9",
      "Viral pneumonia": "J12.9",
      "Asthma exacerbation": "J45.901",
      "GERD": "K21.9"
    }
    return icdMap[condition] || "R69"
  }

  const determineUrgency = (
    blind: AgentOpinion[], 
    informed: AgentOpinion[], 
    scrutinizers: AgentOpinion[], 
    final: AgentOpinion
  ): "immediate" | "urgent" | "moderate" | "low" => {
    const allRedFlags = [...blind, ...informed, ...scrutinizers, final]
      .flatMap(a => a.redFlags || [])
    
    if (allRedFlags.some(flag => flag.toLowerCase().includes("immediate"))) return "immediate"
    if (allRedFlags.length > 3 || final.confidence < 0.5) return "urgent"
    if (allRedFlags.length > 0) return "moderate"
    return "low"
  }

  const calculateConsensus = (
    blind: AgentOpinion[], 
    informed: AgentOpinion[], 
    final: AgentOpinion
  ): number => {
    const allDiagnoses = [...blind, ...informed, final].map(a => a.diagnosis[0])
    const uniqueDiagnoses = new Set(allDiagnoses)
    return 1 - (uniqueDiagnoses.size / allDiagnoses.length)
  }

  return {
    protocol,
    agentStatuses,
    error,
    isComplete: protocol.status === "complete",
    isError: protocol.status === "error"
  }
}
