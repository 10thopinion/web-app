"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { AgentOpinion } from "@/types/medical"
import { motion } from "framer-motion"
import { Bot, Brain, CheckCircle, AlertTriangle, Loader2 } from "lucide-react"

interface AgentCardProps {
  agent: Partial<AgentOpinion>
  status: "waiting" | "thinking" | "complete"
  delay?: number
}

export function AgentCard({ agent, status, delay = 0 }: AgentCardProps) {
  const getStatusIcon = () => {
    switch (status) {
      case "waiting":
        return <Bot className="h-5 w-5 text-muted-foreground" />
      case "thinking":
        return <Loader2 className="h-5 w-5 text-primary animate-spin" />
      case "complete":
        return <CheckCircle className="h-5 w-5 text-green-500" />
    }
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
    >
      <Card className={cn(
        "relative overflow-hidden transition-all duration-300",
        status === "thinking" && "agent-active border-primary/50",
        status === "complete" && "border-green-500/30"
      )}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-lg flex items-center gap-2">
                {getStatusIcon()}
                {agent.agentName || "Agent"}
              </CardTitle>
              <CardDescription className="text-sm">
                {agent.specialization}
              </CardDescription>
            </div>
            <Badge variant="secondary" className={getAgentTypeColor()}>
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
                <div className="flex items-start gap-2 p-2 bg-destructive/10 rounded-md">
                  <AlertTriangle className="h-4 w-4 text-destructive mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-destructive">Red Flags:</p>
                    <ul className="text-xs text-destructive/80 mt-1">
                      {agent.redFlags.map((flag, idx) => (
                        <li key={idx}>• {flag}</li>
                      ))}
                    </ul>
                  </div>
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
