import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/services/dynamodb"

export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const sessionId = params.sessionId
    console.log("[API] Retrieving session:", sessionId)
    
    const session = await getSession(sessionId)
    
    if (!session) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      session
    })
  } catch (error) {
    console.error("[API] Error retrieving session:", error)
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : "Failed to retrieve session" 
      },
      { status: 500 }
    )
  }
}