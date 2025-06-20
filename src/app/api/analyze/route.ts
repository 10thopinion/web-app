import { NextRequest, NextResponse } from "next/server"
import { runTenthOpinionProtocol } from "@/services/bedrock"
import { PatientData } from "@/types/medical"

export async function POST(request: NextRequest) {
  try {
    const patientData: PatientData = await request.json()
    
    // Validate required fields
    if (!patientData.symptoms || patientData.symptoms.length === 0) {
      return NextResponse.json(
        { error: "Symptoms are required" },
        { status: 400 }
      )
    }
    
    if (!patientData.description || patientData.description.trim() === "") {
      return NextResponse.json(
        { error: "Description is required" },
        { status: 400 }
      )
    }

    // Run the Tenth Opinion Protocol
    const results = await runTenthOpinionProtocol(patientData)
    
    return NextResponse.json({
      success: true,
      results,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json(
      { 
        error: "An error occurred during analysis",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}

// For demo/testing purposes - returns mock data
export async function GET() {
  return NextResponse.json({
    message: "Tenth Opinion Protocol API",
    version: "1.0.0",
    endpoints: {
      POST: "/api/analyze - Submit patient data for analysis"
    }
  })
}
