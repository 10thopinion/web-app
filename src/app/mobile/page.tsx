"use client"

import { useState } from "react"
import { MobileHeader } from "@/components/mobile/mobile-header"
import { MobilePatientForm } from "@/components/mobile/mobile-patient-form"
import { ProtocolRunner } from "@/components/protocol/protocol-runner"
import { PatientData } from "@/types/medical"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Wifi, WifiOff, Mail } from "lucide-react"
import { useNetworkInfo, getNetworkDisplayType, getNetworkQuality } from "@/hooks/use-network-info"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function MobilePage() {
  const [patientData, setPatientData] = useState<PatientData | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [emailDelivery, setEmailDelivery] = useState(false)
  const networkInfo = useNetworkInfo()

  const handleSubmit = (data: PatientData & { email?: string }) => {
    setEmailDelivery(!!data.email)
    setPatientData(data)
    setIsAnalyzing(true)
    
    // Vibrate on submission if supported
    if ('vibrate' in navigator) {
      navigator.vibrate(200)
    }
  }

  const handleReset = () => {
    setPatientData(null)
    setIsAnalyzing(false)
    setEmailDelivery(false)
  }

  const networkQuality = getNetworkQuality(networkInfo)
  const displayType = getNetworkDisplayType(networkInfo.effectiveType)

  return (
    <div className="min-h-screen bg-background pb-safe">
      <MobileHeader />
      
      {/* Network Status Badge */}
      <div className="fixed top-20 right-4 z-50">
        <Badge 
          variant={networkInfo.isOnline ? (networkQuality === "excellent" ? "default" : networkQuality === "good" ? "secondary" : "outline") : "destructive"}
          className="flex items-center gap-1"
        >
          {networkInfo.isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
          {networkInfo.isOnline ? displayType : "Offline"}
        </Badge>
      </div>
      
      <main className="container mx-auto px-4 py-4 max-w-lg">
        {!isAnalyzing ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            {/* Mobile Hero */}
            <div className="text-center space-y-4 mb-8">
              <h1 className="text-3xl font-bold">
                10TH OPINION
              </h1>
              <p className="text-lg text-muted-foreground">
                Get AI medical analysis on your phone
              </p>
              <div className="flex flex-wrap justify-center gap-2 text-xs">
                <Badge variant="outline">30-second analysis</Badge>
                <Badge variant="outline">Works on {displayType}</Badge>
                <Badge variant="outline">Camera ready</Badge>
                {emailDelivery && <Badge variant="outline"><Mail className="h-3 w-3 mr-1" />Email delivery</Badge>}
              </div>
            </div>

            {/* Network Quality Alert */}
            {networkQuality === "poor" && networkInfo.isOnline && (
              <Alert className="mb-4">
                <AlertDescription className="text-sm">
                  <strong>Poor network connection detected.</strong> Consider enabling email delivery for your results.
                </AlertDescription>
              </Alert>
            )}

            {/* Mobile Patient Form */}
            <MobilePatientForm onSubmit={handleSubmit} networkQuality={networkQuality} />
            
            {/* Mobile Disclaimer */}
            <div className="p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-900">
              <p className="text-xs text-orange-800 dark:text-orange-300">
                <strong>Medical Disclaimer:</strong> This analysis is for informational purposes only. 
                Always consult healthcare professionals for medical advice.
              </p>
            </div>
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