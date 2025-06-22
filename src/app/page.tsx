"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { PatientForm } from "@/components/protocol/patient-form"
import { ProtocolRunner } from "@/components/protocol/protocol-runner"
import { PatientData } from "@/types/medical"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

import { Mascot } from "@/components/mascot"

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
    <div className="min-h-screen bg-background tenth-gradient-medical">
      <Header />
      
      {/* Floating mascots for delight */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <motion.div
          className="absolute top-20 right-10 opacity-10"
          animate={{
            y: [0, -20, 0],
            x: [0, 10, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <Mascot variant={3} size="xl" animate={false} />
        </motion.div>
        <motion.div
          className="absolute bottom-20 left-10 opacity-10"
          animate={{
            y: [0, 20, 0],
            x: [0, -10, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <Mascot variant={7} size="xl" animate={false} />
        </motion.div>
        <motion.div
          className="absolute top-1/2 left-20 opacity-5"
          animate={{
            y: [0, -30, 0],
            rotate: [0, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          <Mascot variant={1} size="xl" animate={false} />
        </motion.div>
        <motion.div
          className="absolute top-40 right-1/3 opacity-5"
          animate={{
            y: [0, 30, 0],
            x: [0, -20, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <Mascot variant={5} size="lg" animate={false} />
        </motion.div>
        <motion.div
          className="absolute bottom-1/3 right-40 opacity-8"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, -10, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <Mascot variant={9} size="md" animate={false} />
        </motion.div>
      </div>
      
      <main className="container mx-auto px-4 py-8 relative z-10">
        {!isAnalyzing ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            {/* Hero Section */}
            <motion.div 
              className="text-center space-y-8 mb-16 relative"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              {/* Subtle animated background element */}
              <motion.div
                className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5"
                animate={{ rotate: 360 }}
                transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
              >
                <svg width="400" height="400" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="var(--tenth-blue)" strokeWidth="8" />
                  <circle cx="50" cy="50" r="20" fill="var(--tenth-blue)" />
                </svg>
              </motion.div>
              
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <Badge variant="outline" className="tenth-badge mb-8 text-base px-6 py-3 font-bold shadow-lg">
                TRANSFORMING MEDICAL ANALYSIS
                </Badge>
              </motion.div>
              
              <motion.h1 
                className="text-6xl md:text-8xl font-black tenth-heading-1 mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                <span className="bg-gradient-to-r from-[var(--tenth-blue)] via-[var(--color-agent-1)] to-[var(--color-agent-5)] bg-clip-text text-transparent animate-gradient-x">
                  10TH OPINION
                </span>
              </motion.h1>
              
              <motion.p 
                className="text-2xl md:text-3xl text-foreground max-w-4xl mx-auto tenth-body-large leading-tight font-semibold mb-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.6 }}
              >
                <span className="text-[var(--tenth-blue)] font-black">10 opinions are better than one</span>. Get comprehensive insights in <span className="text-[var(--color-agent-3)] font-black">30 seconds</span>.
              </motion.p>
              
              <motion.p 
                className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto tenth-body mb-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.6 }}
              >
                No more hours in waiting rooms. No more single perspectives. Get multiple expert opinions analyzing your symptoms from different medical angles—providing a comprehensive overview.
              </motion.p>
              
              {/* Pragmatic Truth Points */}
              <motion.div 
                className="flex flex-wrap justify-center gap-4 text-sm font-medium mb-8"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.5 }}
              >
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  Zero Wait Time
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                  Minimal Cost Analysis
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                  <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                  Available 24/7
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  No Appointments Needed
                </div>
              </motion.div>
              
              <motion.div 
                className="flex justify-center gap-4 mt-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.5 }}
              >
                <Button 
                  className="tenth-button-primary text-lg px-8 py-6 h-auto group"
                  onClick={() => {
                    const formElement = document.getElementById('patient-form');
                    formElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }}
                >
                  Start Analysis
                  <motion.span
                    className="ml-2 inline-block"
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    →
                  </motion.span>
                </Button>
                <Button 
                  variant="outline" 
                  className="tenth-button-secondary text-lg px-8 py-6 h-auto"
                  onClick={() => {
                    const featuresElement = document.getElementById('features');
                    featuresElement?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                >
                  Learn More
                </Button>
              </motion.div>
            </motion.div>

            {/* Features Grid with Emotional Design */}
            <div id="features" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                whileHover={{ y: -8, transition: { type: "spring", stiffness: 300 } }}
              >
                <Card className="tenth-card h-full group overflow-visible">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-xl tenth-heading-4 font-bold">10 Opinions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-base text-muted-foreground tenth-body mb-4">
                      Each specialized agent analyzes your case from a unique medical perspective
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <motion.div 
                          key={i} 
                          className="opacity-0 group-hover:opacity-100" 
                          initial={{ scale: 0 }}
                          whileHover={{ scale: 1 }}
                          transition={{ 
                            delay: i * 0.05,
                            type: "spring",
                            stiffness: 500
                          }}
                        >
                          <Mascot variant={i as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10} size="sm" animate={true} />
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                whileHover={{ y: -8, transition: { type: "spring", stiffness: 300 } }}
              >
                <Card className="tenth-card h-full group">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-xl tenth-heading-4 font-bold">Privacy First</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-base text-muted-foreground tenth-body mb-4">
                      HIPAA-compliant, encrypted, no data permanently stored
                    </p>
                    <div className="mt-3 flex items-center gap-2 text-xs text-green-600 dark:text-green-400">
                      <div className="h-2 w-2 rounded-full bg-green-500 tenth-glow" />
                      <span>256-bit encryption</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                whileHover={{ y: -8, transition: { type: "spring", stiffness: 300 } }}
              >
                <Card className="tenth-card h-full group">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-xl tenth-heading-4 font-bold">Fast Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-base text-muted-foreground tenth-body mb-4">
                      Get comprehensive results in under 30 seconds
                    </p>
                    <div className="mt-3">
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-primary to-primary/60"
                          initial={{ width: "0%" }}
                          animate={{ width: "100%" }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "linear"
                          }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                whileHover={{ y: -8, transition: { type: "spring", stiffness: 300 } }}
              >
                <Card className="tenth-card h-full group">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-xl tenth-heading-4 font-bold">Expert Validation</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-base text-muted-foreground tenth-body mb-4">
                      Human review service for complex cases
                    </p>
                    <div className="mt-3 flex -space-x-2">
                      {["Dr. Smith", "Dr. Johnson", "Dr. Williams"].map((name, i) => (
                        <div
                          key={i}
                          className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 border-2 border-background flex items-center justify-center text-xs font-semibold"
                          title={name}
                        >
                          {name[4]}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Patient Form */}
            <PatientForm onSubmit={handleSubmit} />

            {/* Trust Section
            <motion.div 
              className="text-center mb-12"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold tenth-heading-2 mb-4">
                Trusted by Healthcare Professionals
              </h2>
              <p className="text-lg text-muted-foreground tenth-body-large max-w-2xl mx-auto mb-8">
                Our system analyzes thousands of medical cases daily, providing comprehensive insights that help you understand your symptoms better.
              </p>
              <div className="flex justify-center gap-8 flex-wrap">
                <motion.div 
                  className="text-sm font-medium text-muted-foreground"
                  whileHover={{ scale: 1.05 }}
                >
                  <span>10,000+ Cases Daily</span>
                </motion.div>
                <motion.div 
                  className="text-sm font-medium text-muted-foreground"
                  whileHover={{ scale: 1.05 }}
                >
                  <span>99.7% Accuracy</span>
                </motion.div>
                <motion.div 
                  className="text-sm font-medium text-muted-foreground"
                  whileHover={{ scale: 1.05 }}
                >
                  <span></span>
                </motion.div>
              </div>
            </motion.div> */}
            
            {/* Disclaimer */}
            <Card className="border-orange-200 dark:border-orange-900 bg-orange-50/50 dark:bg-orange-950/20 tenth-card">
              <CardHeader>
                <CardTitle className="text-orange-900 dark:text-orange-200">
                  Important Medical Disclaimer
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-orange-800 dark:text-orange-300">
                  This system is designed for informational purposes only and should not replace
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
