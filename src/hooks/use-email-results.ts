"use client"

import { useEffect } from "react"
import { ProtocolSummary } from "@/types/protocol"
import { PatientData } from "@/types/medical"

interface UseEmailResultsProps {
  isComplete: boolean
  summary?: ProtocolSummary
  sessionId: string
  patientData: PatientData & { email?: string }
}

export function useEmailResults({ 
  isComplete, 
  summary, 
  sessionId, 
  patientData 
}: UseEmailResultsProps) {
  
  useEffect(() => {
    // Only send email if analysis is complete, we have results, and email was provided
    if (isComplete && summary && patientData.email) {
      sendResultsEmail()
    }
  }, [isComplete])

  const sendResultsEmail = async () => {
    try {
      const response = await fetch("/api/send-results", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: patientData.email,
          sessionId,
          summary,
          patientInfo: {
            symptoms: [...(patientData.structuredSymptoms?.map(s => s.label) || []), ...patientData.symptoms],
            description: patientData.description,
            age: patientData.age,
            biologicalSex: patientData.biologicalSex,
          },
        }),
      })

      if (!response.ok) {
        console.error("Failed to send email results")
      }
    } catch (error) {
      console.error("Error sending email:", error)
    }
  }
}