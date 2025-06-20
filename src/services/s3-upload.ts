import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

const BUCKET_NAME = process.env.S3_BUCKET_NAME || "tenth-opinion-medical-images"

export interface UploadResult {
  key: string
  url: string
  etag?: string
}

/**
 * Generate a presigned URL for uploading an image directly from the browser
 * This is more secure than handling uploads server-side
 */
export async function getPresignedUploadUrl(
  fileName: string,
  contentType: string,
  sessionId: string
): Promise<{ uploadUrl: string; key: string }> {
  // Create a unique key with session ID to organize uploads
  const key = `sessions/${sessionId}/images/${Date.now()}-${fileName}`

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    ContentType: contentType,
    // Add metadata for tracking
    Metadata: {
      sessionId,
      uploadDate: new Date().toISOString(),
    },
    // Enable server-side encryption
    ServerSideEncryption: "AES256",
  })

  // Generate presigned URL valid for 5 minutes
  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 })

  return { uploadUrl, key }
}

/**
 * Generate a presigned URL for viewing an uploaded image
 */
export async function getPresignedViewUrl(key: string): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  })

  // Generate presigned URL valid for 1 hour
  return await getSignedUrl(s3Client, command, { expiresIn: 3600 })
}

/**
 * Upload an image directly from the server (for smaller files)
 */
export async function uploadImage(
  file: Buffer | Uint8Array,
  fileName: string,
  contentType: string,
  sessionId: string
): Promise<UploadResult> {
  const key = `sessions/${sessionId}/images/${Date.now()}-${fileName}`

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: file,
    ContentType: contentType,
    Metadata: {
      sessionId,
      uploadDate: new Date().toISOString(),
    },
    ServerSideEncryption: "AES256",
  })

  const response = await s3Client.send(command)
  const url = await getPresignedViewUrl(key)

  return {
    key,
    url,
    etag: response.ETag,
  }
}

/**
 * Validate file type and size before upload
 */
export function validateImageFile(
  file: File | { size: number; type: string }
): { valid: boolean; error?: string } {
  const maxSize = 5 * 1024 * 1024 // 5MB
  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"]

  if (file.size > maxSize) {
    return { valid: false, error: "File size exceeds 5MB limit" }
  }

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: "Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed",
    }
  }

  return { valid: true }
}
