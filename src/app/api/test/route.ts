import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const envCheck = {
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID ? "Set" : "Not set",
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY ? "Set" : "Not set",
    AWS_REGION: process.env.AWS_REGION || "Not set",
    MODEL_SETUP: process.env.MODEL_SETUP || "Not set",
    S3_BUCKET_NAME: process.env.S3_BUCKET_NAME || "Not set",
    DYNAMODB_TABLE_NAME: process.env.DYNAMODB_TABLE_NAME || "Not set"
  };
  
  return NextResponse.json({ 
    status: "ok", 
    timestamp: new Date().toISOString(),
    environment: envCheck
  })
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  return NextResponse.json({ 
    status: "test received", 
    received: body,
    timestamp: new Date().toISOString() 
  })
}
