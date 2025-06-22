// Agent progress indicator component
import { motion } from "framer-motion"
import { Loader2, CheckCircle, AlertCircle, Brain } from "lucide-react"
import { cn } from "@/lib/utils"

interface AgentProgressProps {
  agentName: string
  status: "waiting" | "thinking" | "complete" | "error"
  confidence?: number
  diagnosis?: string
  processingTime?: number
}

export function AgentProgress({ 
  agentName, 
  status, 
  confidence, 
  diagnosis,
  processingTime 
}: AgentProgressProps) {
  const getStatusIcon = () => {
    switch (status) {
      case "waiting":
        return <Brain className="h-4 w-4 text-muted-foreground" />
      case "thinking":
        return <Loader2 className="h-4 w-4 animate-spin text-primary" />
      case "complete":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-600" />
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case "waiting":
        return "bg-muted/50"
      case "thinking":
        return "bg-primary/10"
      case "complete":
        return "bg-green-50 dark:bg-green-950/20"
      case "error":
        return "bg-red-50 dark:bg-red-950/20"
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex items-center justify-between p-3 rounded-lg transition-colors",
        getStatusColor()
      )}
    >
      <div className="flex items-center gap-3">
        {getStatusIcon()}
        <div>
          <p className="font-medium text-sm">{agentName}</p>
          {status === "complete" && diagnosis && (
            <p className="text-xs text-muted-foreground">{diagnosis}</p>
          )}
        </div>
      </div>
      
      <div className="text-right">
        {status === "complete" && confidence !== undefined && (
          <div className="flex items-center gap-2">
            <div className="text-xs text-muted-foreground">
              {processingTime ? `${(processingTime / 1000).toFixed(1)}s` : ""}
            </div>
            <div className={cn(
              "text-xs font-medium px-2 py-1 rounded",
              confidence > 0.8 ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300" :
              confidence > 0.6 ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300" :
              "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
            )}>
              {Math.round(confidence * 100)}%
            </div>
          </div>
        )}
        {status === "thinking" && (
          <p className="text-xs text-muted-foreground animate-pulse">Analyzing...</p>
        )}
      </div>
    </motion.div>
  )
}
