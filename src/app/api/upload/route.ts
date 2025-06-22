import { NextRequest, NextResponse } from "next/server"
import { getPresignedUploadUrl, validateImageFile } from "@/services/s3-upload"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { fileName, contentType, fileSize, sessionId } = body

    // Validate input
    if (!fileName || !contentType || !fileSize || !sessionId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Validate file
    const validation = validateImageFile({ size: fileSize, type: contentType })
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    // Generate presigned URL
    const { uploadUrl, key } = await getPresignedUploadUrl(
      fileName,
      contentType,
      sessionId
    )

    return NextResponse.json({
      success: true,
      uploadUrl,
      key,
      expiresIn: 300 // 5 minutes
    })

  } catch (error) {
    console.error("[Upload] Error:", error)
    return NextResponse.json(
      { error: "Failed to generate upload URL" },
      { status: 500 }
    )
  }
}
