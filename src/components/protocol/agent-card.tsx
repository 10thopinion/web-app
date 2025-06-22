"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { AgentOpinion } from "@/types/medical"
import { motion } from "framer-motion"

import { Mascot, MascotSparkle } from "@/components/mascot"

interface AgentCardProps {
  agent: Partial<AgentOpinion>
  status: "waiting" | "thinking" | "complete"
  delay?: number
}

export function AgentCard({ agent, status, delay = 0 }: AgentCardProps) {
  // Map agent IDs to mascot variants
  const getAgentVariant = (agentId?: string): 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 => {
    const idMap: Record<string, 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10> = {
      "agent-1": 1,
      "agent-2": 2,
      "agent-3": 3,
      "agent-4": 4,
      "agent-5": 5,
      "agent-6": 6,
      "agent-7": 7,
      "agent-8": 8,
      "agent-9": 9,
      "agent-10": 10
    }
    return idMap[agentId || ""] || 1
  }

  const getAgentTypeColor = () => {
    switch (agent.agentType) {
      case "blind":
        return "bg-blue-500/10 text-blue-700 dark:text-blue-400"
      case "informed":
        return "bg-purple-500/10 text-purple-700 dark:text-purple-400"
      case "scrutinizer":
        return "bg-orange-500/10 text-orange-700 dark:text-orange-400"
      case "final":
        return "bg-green-500/10 text-green-700 dark:text-green-400"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const agentVariant = getAgentVariant(agent.agentId)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ y: -4 }}
    >
      <Card className={cn(
        "relative overflow-hidden transition-all duration-300 group",
        `tenth-agent-card-${agentVariant}`,
        status === "thinking" && "tenth-glow border-opacity-100",
        status === "complete" && "tenth-success"
      )}>
        {/* Floating mascot background */}
        {status === "complete" && (
          <div className="absolute top-2 right-2 opacity-20">
            <Mascot variant={agentVariant} size="lg" animate={false} />
          </div>
        )}
        
        <CardHeader className="pb-3 relative">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              {/* Agent Mascot */}
              <div className="relative">
                <Mascot 
                  variant={agentVariant} 
                  size="md" 
                  animate={false}
                  className={cn(
                    "transition-all",
                    status === "complete" && "group-hover:scale-110"
                  )}
                />

                {/* {status === "thinking" && <MascotSparkle delay={0} visible={false} />} */}
              </div>
              
              <div className="space-y-1">
                <CardTitle className="text-lg tenth-heading-4">
                  {agent.agentName || "Agent"}
                </CardTitle>
                <CardDescription className="text-sm">
                  {agent.specialization}
                </CardDescription>
              </div>
            </div>
            <Badge variant="secondary" className={cn(getAgentTypeColor(), "tenth-badge")}>
              {agent.agentType}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === "waiting" && (
            <p className="text-sm text-muted-foreground">Waiting for analysis...</p>
          )}
          
          {status === "thinking" && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Analyzing patient data<span className="thinking" />
              </p>
              <Progress value={33} className="h-1" />
            </div>
          )}
          
          {status === "complete" && agent.diagnosis && (
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium mb-1">Primary Diagnosis:</p>
                <div className="flex flex-wrap gap-1">
                  {agent.diagnosis.map((diag, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {diag}
                    </Badge>
                  ))}
                </div>
              </div>
              
              {agent.confidence !== undefined && (
                <div>
                  <p className="text-sm font-medium mb-1">Confidence:</p>
                  <div className="flex items-center gap-2">
                    <Progress value={agent.confidence * 100} className="h-2 flex-1" />
                    <span className="text-sm font-medium">{Math.round(agent.confidence * 100)}%</span>
                  </div>
                </div>
              )}
              
              {agent.reasoning && (
                <div>
                  <p className="text-sm font-medium mb-1">Reasoning:</p>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {agent.reasoning}
                  </p>
                </div>
              )}
              
              {agent.redFlags && agent.redFlags.length > 0 && (
                <div className="p-2 bg-destructive/10 rounded-md">
                  <p className="text-sm font-medium text-destructive">Red Flags:</p>
                  <ul className="text-xs text-destructive/80 mt-1">
                    {agent.redFlags.map((flag, idx) => (
                      <li key={idx}>• {flag}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div className="text-xs text-muted-foreground pt-2 border-t">
                Model: {agent.model}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
