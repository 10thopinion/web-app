// Real-time protocol progress visualization
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AgentProgress } from "./agent-progress"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Clock, Activity, Brain, Shield, Zap, Sparkles, Heart } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { AGENT_CONFIGS } from "@/types/protocol"
import { Mascot } from "@/components/mascot"

interface ProtocolProgressPanelProps {
  agentStatuses: Record<string, "waiting" | "thinking" | "complete" | "error">
  startTime: Date
  sessionId: string
  totalAgents?: number
}

export function ProtocolProgressPanel({ 
  agentStatuses, 
  startTime, 
  sessionId,
  totalAgents = 10 
}: ProtocolProgressPanelProps) {
  // Calculate progress
  const completedAgents = Object.values(agentStatuses).filter(s => s === "complete").length
  const activeAgents = Object.values(agentStatuses).filter(s => s === "thinking").length
  const progress = (completedAgents / totalAgents) * 100
  
  // Calculate elapsed time
  const elapsedSeconds = Math.floor((Date.now() - startTime.getTime()) / 1000)
  const estimatedTotal = Math.ceil((elapsedSeconds / Math.max(completedAgents, 1)) * totalAgents)
  const remainingSeconds = Math.max(0, estimatedTotal - elapsedSeconds)
  
  // Group agents by type
  const blindAgents = AGENT_CONFIGS.blind
  const informedAgents = AGENT_CONFIGS.informed
  const scrutinizers = AGENT_CONFIGS.scrutinizers
  const finalAgent = AGENT_CONFIGS.final

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Protocol Analysis Progress
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            Session: {sessionId}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              {completedAgents} of {totalAgents} agents complete
            </span>
            <span className="text-muted-foreground">
              {progress.toFixed(0)}%
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Time Stats */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Elapsed</p>
            <p className="text-sm font-medium flex items-center justify-center gap-1">
              <Clock className="h-3 w-3" />
              {Math.floor(elapsedSeconds / 60)}:{(elapsedSeconds % 60).toString().padStart(2, '0')}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Active</p>
            <p className="text-sm font-medium flex items-center justify-center gap-1">
              <Zap className="h-3 w-3 text-yellow-500" />
              {activeAgents} agents
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Remaining</p>
            <p className="text-sm font-medium flex items-center justify-center gap-1">
              <Clock className="h-3 w-3" />
              ~{Math.floor(remainingSeconds / 60)}:{(remainingSeconds % 60).toString().padStart(2, '0')}
            </p>
          </div>
        </div>

        {/* Agent Groups */}
        <div className="space-y-3">
          {/* Blind Agents */}
          <div className="space-y-1">
            <h4 className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <Brain className="h-3 w-3" />
              Independent Analysis (1-4)
            </h4>
            <div className="space-y-1">
              {blindAgents.map(agent => (
                <AgentProgress
                  key={agent.id}
                  agentName={agent.name}
                  status={agentStatuses[agent.id] || "waiting"}
                />
              ))}
            </div>
          </div>

          {/* Informed Agents */}
          <div className="space-y-1">
            <h4 className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <Brain className="h-3 w-3" />
              Informed Analysis (5-7)
            </h4>
            <div className="space-y-1">
              {informedAgents.map(agent => (
                <AgentProgress
                  key={agent.id}
                  agentName={agent.name}
                  status={agentStatuses[agent.id] || "waiting"}
                />
              ))}
            </div>
          </div>

          {/* Scrutinizers */}
          <div className="space-y-1">
            <h4 className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <Shield className="h-3 w-3" />
              Quality Control (8-9)
            </h4>
            <div className="space-y-1">
              {scrutinizers.map(agent => (
                <AgentProgress
                  key={agent.id}
                  agentName={agent.name}
                  status={agentStatuses[agent.id] || "waiting"}
                />
              ))}
            </div>
          </div>

          {/* Final Authority */}
          <div className="space-y-1">
            <h4 className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <Shield className="h-3 w-3" />
              Final Authority (10)
            </h4>
            <AgentProgress
              agentName={finalAgent.name}
              status={agentStatuses[finalAgent.id] || "waiting"}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
