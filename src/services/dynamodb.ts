import { DynamoDBClient } from "@aws-sdk/client-dynamodb"
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  UpdateCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb"
import { TenthOpinionProtocol } from "@/types/protocol"

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

const docClient = DynamoDBDocumentClient.from(client, {
  marshallOptions: {
    removeUndefinedValues: true
  }
})
const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME || "TenthOpinionSessions"

/**
 * Save a new session to DynamoDB
 */
export async function saveSession(protocol: TenthOpinionProtocol): Promise<void> {
  const ttl = Math.floor(Date.now() / 1000) + 86400 // 24 hours from now

  const command = new PutCommand({
    TableName: TABLE_NAME,
    Item: {
      sessionId: protocol.sessionId,
      timestamp: protocol.startTime.getTime(),
      patientData: protocol.patientData,
      agents: protocol.agents,
      summary: protocol.summary,
      expertTrigger: protocol.expertTrigger,
      status: protocol.status,
      startTime: protocol.startTime.toISOString(),
      endTime: protocol.endTime?.toISOString(),
      ttl, // Auto-delete after 24 hours
      // Anonymous analytics data
      analytics: {
        totalAgents: 10,
        completionTime: protocol.endTime
          ? protocol.endTime.getTime() - protocol.startTime.getTime()
          : null,
        primaryDiagnosis: protocol.summary?.primaryDiagnosis.condition,
        confidenceLevel: protocol.summary?.primaryDiagnosis.confidence,
        urgencyLevel: protocol.summary?.urgencyLevel,
        consensusScore: protocol.summary?.consensus,
        expertTriggered: protocol.expertTrigger?.triggered || false,
      },
    },
  })

  await docClient.send(command)
}

/**
 * Update session status
 */
export async function updateSessionStatus(
  sessionId: string,
  status: TenthOpinionProtocol["status"],
  additionalData?: Partial<TenthOpinionProtocol>,
  originalTimestamp?: number
): Promise<void> {
  const updateExpressions: string[] = ["#status = :status"]
  const expressionAttributeNames: Record<string, string> = { "#status": "status" }
  const expressionAttributeValues: Record<string, any> = { ":status": status }

  if (additionalData?.endTime) {
    updateExpressions.push("endTime = :endTime")
    expressionAttributeValues[":endTime"] = additionalData.endTime.toISOString()
  }

  if (additionalData?.summary) {
    updateExpressions.push("summary = :summary")
    expressionAttributeValues[":summary"] = additionalData.summary
  }

  if (additionalData?.expertTrigger) {
    updateExpressions.push("expertTrigger = :expertTrigger")
    expressionAttributeValues[":expertTrigger"] = additionalData.expertTrigger
  }

  // If no timestamp provided, query for the latest session
  let timestamp = originalTimestamp
  if (!timestamp) {
    const session = await getSession(sessionId)
    if (session) {
      timestamp = session.startTime.getTime()
    } else {
      throw new Error(`Session ${sessionId} not found`)
    }
  }

  const command = new UpdateCommand({
    TableName: TABLE_NAME,
    Key: {
      sessionId,
      timestamp,
    },
    UpdateExpression: `SET ${updateExpressions.join(", ")}`,
    ExpressionAttributeNames: expressionAttributeNames,
    ExpressionAttributeValues: expressionAttributeValues,
  })

  await docClient.send(command)
}

/**
 * Get session by ID
 */
export async function getSession(sessionId: string): Promise<TenthOpinionProtocol | null> {
  const command = new QueryCommand({
    TableName: TABLE_NAME,
    KeyConditionExpression: "sessionId = :sessionId",
    ExpressionAttributeValues: {
      ":sessionId": sessionId,
    },
    ScanIndexForward: false, // Get latest first
    Limit: 1,
  })

  const response = await docClient.send(command)
  
  if (!response.Items || response.Items.length === 0) {
    return null
  }

  const item = response.Items[0]
  
  // Reconstruct the protocol object
  return {
    sessionId: item.sessionId,
    patientData: item.patientData,
    agents: item.agents,
    summary: item.summary,
    expertTrigger: item.expertTrigger,
    startTime: new Date(item.startTime),
    endTime: item.endTime ? new Date(item.endTime) : undefined,
    status: item.status,
  }
}

/**
 * Save anonymous analytics data for continuous improvement
 */
export async function saveAnalyticsData(data: {
  diagnosisType: string
  confidence: number
  consensusScore: number
  urgencyLevel: string
  expertTriggered: boolean
  agentAccuracy?: Record<string, number>
  completionTimeMs: number
}): Promise<void> {
  const command = new PutCommand({
    TableName: `${TABLE_NAME}-Analytics`,
    Item: {
      id: `analytics-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      date: new Date().toISOString().split("T")[0], // YYYY-MM-DD
      ...data,
      ttl: Math.floor(Date.now() / 1000) + 2592000, // 30 days
    },
  })

  try {
    await docClient.send(command)
  } catch (error) {
    // Don't fail the main flow if analytics fails
    console.error("Failed to save analytics:", error)
  }
}

/**
 * Query analytics data for model improvement
 */
export async function getAnalyticsData(
  startDate: string,
  endDate: string
): Promise<any[]> {
  const command = new QueryCommand({
    TableName: `${TABLE_NAME}-Analytics`,
    IndexName: "DateIndex",
    KeyConditionExpression: "#date BETWEEN :startDate AND :endDate",
    ExpressionAttributeNames: {
      "#date": "date",
    },
    ExpressionAttributeValues: {
      ":startDate": startDate,
      ":endDate": endDate,
    },
  })

  const response = await docClient.send(command)
  return response.Items || []
}
