"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { PatientForm } from "@/components/protocol/patient-form"
import { ProtocolRunner } from "@/components/protocol/protocol-runner"
import { PatientData } from "@/types/medical"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield, Zap, Users, Brain } from "lucide-react"

export default function Home() {
  const [patientData, setPatientData] = useState<PatientData | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const handleSubmit = (data: PatientData) => {
    setPatientData(data)
    setIsAnalyzing(true)
  }

  const handleReset = () => {
    setPatientData(null)
    setIsAnalyzing(false)
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {!isAnalyzing ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            {/* Hero Section */}
            <div className="text-center space-y-4 mb-12">
              <Badge variant="outline" className="mb-4">
                AI-Powered Medical Analysis
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Tenth Opinion Protocol
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Revolutionary multi-agent AI system providing comprehensive medical analysis
                through 10 specialized AI opinions
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
              <Card className="bg-gradient-to-br from-background to-muted/20">
                <CardHeader className="pb-3">
                  <Brain className="h-8 w-8 text-primary mb-2" />
                  <CardTitle className="text-lg">10 AI Agents</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Multiple specialized models analyze your symptoms independently
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-background to-muted/20">
                <CardHeader className="pb-3">
                  <Shield className="h-8 w-8 text-primary mb-2" />
                  <CardTitle className="text-lg">Privacy First</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    HIPAA-compliant, encrypted, no data permanently stored
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-background to-muted/20">
                <CardHeader className="pb-3">
                  <Zap className="h-8 w-8 text-primary mb-2" />
                  <CardTitle className="text-lg">Fast Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Get comprehensive results in under 30 seconds
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-background to-muted/20">
                <CardHeader className="pb-3">
                  <Users className="h-8 w-8 text-primary mb-2" />
                  <CardTitle className="text-lg">Expert Validation</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Human expert review triggered for complex cases
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Patient Form */}
            <PatientForm onSubmit={handleSubmit} />

            {/* Disclaimer */}
            <Card className="border-orange-200 dark:border-orange-900 bg-orange-50/50 dark:bg-orange-950/20">
              <CardHeader>
                <CardTitle className="text-orange-900 dark:text-orange-200">
                  Important Medical Disclaimer
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-orange-800 dark:text-orange-300">
                  This AI system is designed for informational purposes only and should not replace
                  professional medical advice, diagnosis, or treatment. Always consult with qualified
                  healthcare providers for medical concerns. In case of emergency, contact emergency
                  services immediately.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <ProtocolRunner patientData={patientData!} onReset={handleReset} />
          </motion.div>
        )}
      </main>
    </div>
  )
}
