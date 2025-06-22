import { NextRequest, NextResponse } from "next/server"
import { getAgentConfigs, ModelTier } from "@/types/protocol"

export async function GET(request: NextRequest) {
  const modelTier = (process.env.MODEL_SETUP as ModelTier) || 'dev'
  const configs = getAgentConfigs(modelTier)
  
  return NextResponse.json({
    status: "ok",
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      MODEL_SETUP: process.env.MODEL_SETUP,
      AWS_REGION: process.env.AWS_REGION,
      AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID ? "Set" : "Not set",
      AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY ? "Set" : "Not set",
    },
    modelTier,
    agentModels: {
      agent1: configs.blind[0].model,
      agent5: configs.informed[0].model,
      agent8: configs.scrutinizers[0].model,
      agent10: configs.final.model,
    },
    totalAgents: configs.blind.length + configs.informed.length + configs.scrutinizers.length + 1
  })
}
