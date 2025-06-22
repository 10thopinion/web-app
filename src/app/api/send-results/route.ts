import { NextRequest, NextResponse } from "next/server"
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses"
import { ProtocolSummary } from "@/types/protocol"

const ses = new SESClient({
  region: process.env.AWS_SES_REGION || process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  }
})

interface SendResultsRequest {
  email: string
  sessionId: string
  summary: ProtocolSummary
  patientInfo: {
    symptoms: string[]
    description: string
    age?: number
    biologicalSex: string
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: SendResultsRequest = await request.json()
    const { email, sessionId, summary, patientInfo } = body

    // Validate email
    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      )
    }

    // Create HTML email content
    const htmlBody = generateEmailHTML(sessionId, summary, patientInfo)
    const textBody = generateEmailText(sessionId, summary, patientInfo)

    // Send email
    const command = new SendEmailCommand({
      Source: process.env.AWS_SES_FROM_EMAIL!,
      Destination: {
        ToAddresses: [email],
      },
      Message: {
        Subject: {
          Data: `Your 10th Opinion Analysis Results - ${summary.primaryDiagnosis.condition}`,
          Charset: "UTF-8",
        },
        Body: {
          Html: {
            Data: htmlBody,
            Charset: "UTF-8",
          },
          Text: {
            Data: textBody,
            Charset: "UTF-8",
          },
        },
      },
      ConfigurationSetName: process.env.AWS_SES_CONFIG_SET,
    })

    await ses.send(command)

    return NextResponse.json({ 
      success: true,
      message: "Analysis results sent to your email" 
    })

  } catch (error) {
    console.error("Failed to send email:", error)
    return NextResponse.json(
      { error: "Failed to send email. Please try again later." },
      { status: 500 }
    )
  }
}

function generateEmailHTML(
  sessionId: string, 
  summary: ProtocolSummary, 
  patientInfo: any
): string {
  const urgencyColors = {
    immediate: "#dc2626",
    urgent: "#ea580c",
    moderate: "#f59e0b",
    low: "#16a34a"
  }

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>10th Opinion Analysis Results</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #3b82f6; margin-bottom: 10px;">10TH OPINION</h1>
    <p style="color: #666; margin: 0;">AI-Powered Medical Analysis Results</p>
  </div>

  <div style="background: #f3f4f6; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
    <h2 style="margin-top: 0; color: #111;">Analysis Summary</h2>
    <p><strong>Session ID:</strong> ${sessionId}</p>
    <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
  </div>

  <div style="background: #fff; border: 2px solid #3b82f6; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
    <h3 style="margin-top: 0; color: #3b82f6;">Primary Diagnosis</h3>
    <h2 style="margin: 10px 0; color: #111;">${summary.primaryDiagnosis.condition}</h2>
    <p style="font-size: 24px; margin: 10px 0;">
      <strong>Confidence:</strong> ${Math.round(summary.primaryDiagnosis.confidence * 100)}%
    </p>
    <p><strong>ICD-10 Code:</strong> ${summary.primaryDiagnosis.icd10Code}</p>
  </div>

  <div style="background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
    <h3 style="margin-top: 0;">Urgency Level</h3>
    <div style="display: inline-block; background: ${urgencyColors[summary.urgencyLevel]}; color: white; padding: 8px 16px; border-radius: 4px; font-weight: bold;">
      ${summary.urgencyLevel.toUpperCase()}
    </div>
  </div>

  ${summary.redFlags.length > 0 ? `
  <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
    <h3 style="margin-top: 0; color: #dc2626;">⚠️ Red Flags - Seek Immediate Care If:</h3>
    <ul style="margin: 0; padding-left: 20px;">
      ${summary.redFlags.map(flag => `<li>${flag}</li>`).join('')}
    </ul>
  </div>
  ` : ''}

  <div style="background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
    <h3 style="margin-top: 0;">Recommended Actions</h3>
    <ol style="margin: 0; padding-left: 20px;">
      ${summary.recommendedActions.map(action => `<li>${action}</li>`).join('')}
    </ol>
  </div>

  ${summary.alternativeDiagnoses.length > 0 ? `
  <div style="background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
    <h3 style="margin-top: 0;">Alternative Diagnoses to Consider</h3>
    ${summary.alternativeDiagnoses.map(alt => `
      <div style="margin-bottom: 10px; padding: 10px; background: #f9fafb; border-radius: 4px;">
        <strong>${alt.condition}</strong> - ${Math.round(alt.confidence * 100)}% confidence
      </div>
    `).join('')}
  </div>
  ` : ''}

  <div style="background: #fef3c7; border: 1px solid #fcd34d; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
    <h4 style="margin-top: 0; color: #92400e;">⚠️ Important Medical Disclaimer</h4>
    <p style="margin: 0; font-size: 14px;">
      This AI-generated analysis is for informational purposes only and should not replace professional medical advice, diagnosis, or treatment. 
      Always consult with qualified healthcare providers for medical concerns. If you are experiencing a medical emergency, 
      contact emergency services immediately.
    </p>
  </div>

  <div style="text-align: center; color: #666; font-size: 14px;">
    <p>Generated by 10th Opinion Protocol</p>
    <p>Powered by AWS Bedrock AI</p>
  </div>

</body>
</html>
  `
}

function generateEmailText(
  sessionId: string, 
  summary: ProtocolSummary, 
  patientInfo: any
): string {
  return `
10TH OPINION - AI Medical Analysis Results
==========================================

Session ID: ${sessionId}
Date: ${new Date().toLocaleDateString()}

PRIMARY DIAGNOSIS
-----------------
${summary.primaryDiagnosis.condition}
Confidence: ${Math.round(summary.primaryDiagnosis.confidence * 100)}%
ICD-10 Code: ${summary.primaryDiagnosis.icd10Code}

URGENCY LEVEL: ${summary.urgencyLevel.toUpperCase()}

${summary.redFlags.length > 0 ? `
RED FLAGS - SEEK IMMEDIATE CARE IF:
${summary.redFlags.map(flag => `• ${flag}`).join('\n')}
` : ''}

RECOMMENDED ACTIONS:
${summary.recommendedActions.map((action, i) => `${i + 1}. ${action}`).join('\n')}

${summary.alternativeDiagnoses.length > 0 ? `
ALTERNATIVE DIAGNOSES TO CONSIDER:
${summary.alternativeDiagnoses.map(alt => 
  `• ${alt.condition} (${Math.round(alt.confidence * 100)}% confidence)`
).join('\n')}
` : ''}

IMPORTANT MEDICAL DISCLAIMER
----------------------------
This AI-generated analysis is for informational purposes only and should not replace 
professional medical advice, diagnosis, or treatment. Always consult with qualified 
healthcare providers for medical concerns. If you are experiencing a medical emergency, 
contact emergency services immediately.

Generated by 10th Opinion Protocol
Powered by AWS Bedrock AI
  `
}