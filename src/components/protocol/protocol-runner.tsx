"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AgentCard } from "./agent-card"
import { ProtocolProgressPanel } from "./protocol-progress-panel"
import { ExpertReviewPanel } from "./expert-review-panel"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PatientData } from "@/types/medical"
import { AGENT_CONFIGS } from "@/types/protocol"
import { motion } from "framer-motion"
import { AlertCircle, CheckCircle2, Activity, FileText, Sparkles } from "lucide-react"
import { useProtocolAnalysis } from "@/hooks/use-protocol-analysis"
import { MedicalChatbot } from "./medical-chatbot"
import { useEmailResults } from "@/hooks/use-email-results"

interface ProtocolRunnerProps {
  patientData: PatientData
  onReset: () => void
}

export function ProtocolRunner({ patientData, onReset }: ProtocolRunnerProps) {
  const { protocol, agentStatuses, error, isComplete } = useProtocolAnalysis({
    patientData,
    useMockData: false // Using real AWS Bedrock integration
  })

  // Send email if requested
  useEmailResults({
    isComplete,
    summary: protocol.summary,
    sessionId: protocol.sessionId,
    patientData
  })

  const getUrgencyColor = (level: string) => {
    switch (level) {
      case "immediate": return "text-red-600 bg-red-100 dark:bg-red-900/20"
      case "urgent": return "text-orange-600 bg-orange-100 dark:bg-orange-900/20"
      case "moderate": return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20"
      case "low": return "text-green-600 bg-green-100 dark:bg-green-900/20"
      default: return ""
    }
  }

  if (error) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-destructive">Analysis Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={onReset}>Try Again</Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Status Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Tenth Opinion Protocol Analysis</CardTitle>
              <CardDescription>
                Session ID: {protocol.sessionId}
              </CardDescription>
            </div>
            <Badge 
              variant={protocol.status === "complete" ? "default" : "secondary"}
              className="capitalize"
            >
              {protocol.status === "complete" && <CheckCircle2 className="mr-1 h-3 w-3" />}
              {protocol.status}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Real-time Progress Panel - Only show while running */}
      {protocol.status !== "complete" && protocol.status !== "error" && (
        <ProtocolProgressPanel
          agentStatuses={agentStatuses}
          startTime={protocol.startTime}
          sessionId={protocol.sessionId}
          totalAgents={10}
        />
      )}

      <Tabs defaultValue="agents" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="agents">Agent Analysis</TabsTrigger>
          <TabsTrigger value="summary" disabled={!protocol.summary}>
            Summary
          </TabsTrigger>
          <TabsTrigger value="chatbot" disabled={!protocol.summary}>
            Ask Questions
          </TabsTrigger>
          <TabsTrigger value="data">Patient Data</TabsTrigger>
        </TabsList>

        <TabsContent value="agents" className="space-y-6">
          {/* Blind Agents */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-500" />
              Blind Diagnosticians (Independent Analysis)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {AGENT_CONFIGS.blind.map((agent, index) => (
                <AgentCard
                  key={agent.id}
                  agent={{
                    ...agent,
                    agentType: "blind",
                    ...protocol.agents.blindAgents.find(a => a.agentId === agent.id)
                  }}
                  status={agentStatuses[agent.id]}
                  delay={index * 0.1}
                />
              ))}
            </div>
          </div>

          {/* Informed Agents */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Activity className="h-5 w-5 text-purple-500" />
              Informed Analysts (Sequential Review)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {AGENT_CONFIGS.informed.map((agent, index) => (
                <AgentCard
                  key={agent.id}
                  agent={{
                    ...agent,
                    agentType: "informed",
                    ...protocol.agents.informedAgents.find(a => a.agentId === agent.id)
                  }}
                  status={agentStatuses[agent.id]}
                  delay={index * 0.1}
                />
              ))}
            </div>
          </div>

          {/* Scrutinizers */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              Scrutinizers (Quality Control)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {AGENT_CONFIGS.scrutinizers.map((agent, index) => (
                <AgentCard
                  key={agent.id}
                  agent={{
                    ...agent,
                    agentType: "scrutinizer",
                    ...protocol.agents.scrutinizers.find(a => a.agentId === agent.id)
                  }}
                  status={agentStatuses[agent.id]}
                  delay={index * 0.1}
                />
              ))}
            </div>
          </div>

          {/* Final Authority */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-green-500" />
              Final Authority (Weighted Synthesis)
            </h3>
            <AgentCard
              agent={{
                ...AGENT_CONFIGS.final,
                agentType: "final",
                ...protocol.agents.finalAuthority
              }}
              status={agentStatuses[AGENT_CONFIGS.final.id]}
              delay={0}
            />
          </div>
        </TabsContent>

        <TabsContent value="summary">
          {protocol.summary && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <Card>
                <CardHeader>
                  <CardTitle>Protocol Summary</CardTitle>
                  <CardDescription>
                    Analysis completed in {protocol.endTime && (
                      Math.round((protocol.endTime.getTime() - protocol.startTime.getTime()) / 1000)
                    )} seconds
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Primary Diagnosis</h4>
                    <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                      <div>
                        <p className="font-semibold">{protocol.summary.primaryDiagnosis.condition}</p>
                        <p className="text-sm text-muted-foreground">
                          ICD-10: {protocol.summary.primaryDiagnosis.icd10Code}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">
                          {Math.round(protocol.summary.primaryDiagnosis.confidence * 100)}%
                        </p>
                        <p className="text-sm text-muted-foreground">Confidence</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Urgency Level</h4>
                    <Badge className={getUrgencyColor(protocol.summary.urgencyLevel)}>
                      {protocol.summary.urgencyLevel.toUpperCase()}
                    </Badge>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Alternative Diagnoses</h4>
                    <div className="space-y-2">
                      {protocol.summary.alternativeDiagnoses.map((alt, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                          <span className="text-sm">{alt.condition}</span>
                          <Badge variant="outline">{Math.round(alt.confidence * 100)}%</Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  {protocol.summary.redFlags.length > 0 && (
                    <div className="p-4 bg-destructive/10 rounded-lg">
                      <h4 className="font-medium mb-2 text-destructive">Red Flags</h4>
                      <ul className="space-y-1">
                        {protocol.summary.redFlags.map((flag, idx) => (
                          <li key={idx} className="text-sm text-destructive">• {flag}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div>
                    <h4 className="font-medium mb-2">Recommended Actions</h4>
                    <ul className="space-y-1">
                      {protocol.summary.recommendedActions.map((action, idx) => (
                        <li key={idx} className="text-sm">• {action}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Agent Consensus</span>
                      <span className="text-sm font-bold">
                        {Math.round(protocol.summary.consensus * 100)}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Expert Review Panel */}
              {protocol.expertTrigger && (
                <ExpertReviewPanel 
                  trigger={protocol.expertTrigger}
                  onRequestExpert={() => {
                    // In production, this would connect to expert system
                    console.log("Requesting expert review...")
                  }}
                />
              )}

              <div className="flex gap-4">
                <Button onClick={() => window.print()} variant="outline">
                  <FileText className="mr-2 h-4 w-4" />
                  Download Report
                </Button>
                <Button onClick={onReset}>
                  Start New Analysis
                </Button>
              </div>
            </motion.div>
          )}
        </TabsContent>

        <TabsContent value="data">
          <Card>
            <CardHeader>
              <CardTitle>Patient Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-1">Symptoms</p>
                <div className="flex flex-wrap gap-2">
                  {/* Display structured symptoms from checklist */}
                  {patientData.structuredSymptoms && patientData.structuredSymptoms.map((symptom, idx) => (
                    <Badge key={`structured-${idx}`} variant="secondary">{symptom}</Badge>
                  ))}
                  {/* Display additional custom symptoms */}
                  {patientData.symptoms.map((symptom, idx) => (
                    <Badge key={`custom-${idx}`} variant="secondary">{symptom}</Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium mb-1">Description</p>
                <p className="text-sm text-muted-foreground">{patientData.description}</p>
              </div>
              
              {patientData.medicalHistory && (
                <div>
                  <p className="text-sm font-medium mb-1">Medical History</p>
                  <p className="text-sm text-muted-foreground">{patientData.medicalHistory}</p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                {patientData.age && (
                  <div>
                    <p className="text-sm font-medium mb-1">Age</p>
                    <p className="text-sm text-muted-foreground">{patientData.age} years</p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium mb-1">Biological Sex</p>
                  <p className="text-sm text-muted-foreground capitalize">{patientData.biologicalSex}</p>
                </div>
              </div>
              
              {patientData.medications && patientData.medications.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-1">Current Medications</p>
                  <div className="flex flex-wrap gap-2">
                    {patientData.medications.map((med, idx) => (
                      <Badge key={idx} variant="outline">{med}</Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {patientData.allergies && patientData.allergies.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-1">Allergies</p>
                  <div className="flex flex-wrap gap-2">
                    {patientData.allergies.map((allergy, idx) => (
                      <Badge key={idx} variant="outline">{allergy}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="chatbot">
          {protocol.summary && isComplete && (
            <MedicalChatbot
              sessionId={protocol.sessionId}
              agentResults={{
                ...protocol.agents.blindAgents.reduce((acc, agent) => ({ ...acc, [agent.agentId]: agent }), {}),
                ...protocol.agents.informedAgents.reduce((acc, agent) => ({ ...acc, [agent.agentId]: agent }), {}),
                ...protocol.agents.scrutinizers.reduce((acc, agent) => ({ ...acc, [agent.agentId]: agent }), {}),
                ...(protocol.agents.finalAuthority ? { [protocol.agents.finalAuthority.agentId]: protocol.agents.finalAuthority } : {})
              }}
              summary={protocol.summary}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
