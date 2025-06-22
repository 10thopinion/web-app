// Expert review notification component
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ExpertTrigger } from "@/types/protocol"
import { UserCheck, AlertTriangle, Activity, Stethoscope } from "lucide-react"
import { motion } from "framer-motion"

interface ExpertReviewPanelProps {
  trigger: ExpertTrigger
  onRequestExpert?: () => void
  expertOpinion?: any
}

export function ExpertReviewPanel({ 
  trigger, 
  onRequestExpert,
  expertOpinion 
}: ExpertReviewPanelProps) {
  const getTriggerIcon = () => {
    switch (trigger.reason) {
      case "low_confidence":
        return <Activity className="h-5 w-5" />
      case "high_disagreement":
        return <AlertTriangle className="h-5 w-5" />
      case "rare_condition":
        return <Stethoscope className="h-5 w-5" />
      case "patient_request":
        return <UserCheck className="h-5 w-5" />
      default:
        return <AlertTriangle className="h-5 w-5" />
    }
  }

  const getTriggerColor = () => {
    switch (trigger.reason) {
      case "low_confidence":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300"
      case "high_disagreement":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300"
      case "rare_condition":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300"
      case "patient_request":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300"
    }
  }

  const getTriggerTitle = () => {
    switch (trigger.reason) {
      case "low_confidence":
        return "Low Diagnostic Confidence"
      case "high_disagreement":
        return "High Agent Disagreement"
      case "rare_condition":
        return "Rare Condition Detected"
      case "patient_request":
        return "Patient Requested Review"
      default:
        return "Expert Review Recommended"
    }
  }

  if (!trigger.triggered) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Alert className="border-2 border-primary/50">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-full ${getTriggerColor()}`}>
            {getTriggerIcon()}
          </div>
          <div className="flex-1">
            <AlertTitle className="text-lg mb-2">
              {getTriggerTitle()}
            </AlertTitle>
            <AlertDescription className="space-y-3">
              <p>{trigger.recommendation}</p>
              
              {trigger.threshold < 1 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Threshold:</span>
                  <Badge variant="outline">
                    {Math.round(trigger.threshold * 100)}%
                  </Badge>
                </div>
              )}

              {!expertOpinion && onRequestExpert && (
                <Button 
                  onClick={onRequestExpert}
                  className="mt-3"
                  variant="default"
                >
                  <UserCheck className="mr-2 h-4 w-4" />
                  Connect with Human Expert
                </Button>
              )}

              {expertOpinion && (
                <Card className="mt-4 bg-primary/5">
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <UserCheck className="h-4 w-4" />
                      Expert Opinion Received
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{expertOpinion.reasoning}</p>
                    {expertOpinion.diagnosis && (
                      <div className="mt-2">
                        <span className="font-medium text-sm">Diagnosis: </span>
                        <span className="text-sm">{expertOpinion.diagnosis.join(", ")}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </AlertDescription>
          </div>
        </div>
      </Alert>
    </motion.div>
  )
}
