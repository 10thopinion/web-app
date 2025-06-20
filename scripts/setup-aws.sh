#!/bin/bash

# Tenth Opinion Protocol - AWS Setup Script
# This script sets up the required AWS services for the project

set -e

echo "🚀 Setting up AWS services for Tenth Opinion Protocol..."
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}AWS CLI is not installed. Please install it first.${NC}"
    exit 1
fi

# Check if AWS is configured
if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${RED}AWS is not configured. Please run 'aws configure' first.${NC}"
    exit 1
fi

# Get AWS account ID and region
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
REGION=$(aws configure get region)
echo -e "${GREEN}AWS Account ID: $ACCOUNT_ID${NC}"
echo -e "${GREEN}AWS Region: $REGION${NC}"

# Generate random suffix for unique resource names
RANDOM_SUFFIX=$(openssl rand -hex 4)
BUCKET_NAME="tenth-opinion-medical-images-${RANDOM_SUFFIX}"
TABLE_NAME="TenthOpinionSessions"
ANALYTICS_TABLE_NAME="TenthOpinionSessions-Analytics"

echo ""
echo "📦 Creating S3 Bucket..."
echo "========================"

# Create S3 bucket
if aws s3 mb s3://${BUCKET_NAME} --region ${REGION} 2>/dev/null; then
    echo -e "${GREEN}✓ S3 bucket created: ${BUCKET_NAME}${NC}"
else
    echo -e "${YELLOW}⚠ S3 bucket creation failed or already exists${NC}"
fi

# Enable encryption on bucket
aws s3api put-bucket-encryption \
    --bucket ${BUCKET_NAME} \
    --server-side-encryption-configuration '{
        "Rules": [{
            "ApplyServerSideEncryptionByDefault": {
                "SSEAlgorithm": "AES256"
            }
        }]
    }' 2>/dev/null || echo -e "${YELLOW}⚠ Failed to set encryption${NC}"

# Set lifecycle policy
aws s3api put-bucket-lifecycle-configuration \
    --bucket ${BUCKET_NAME} \
    --lifecycle-configuration '{
        "Rules": [{
            "ID": "DeleteAfter24Hours",
            "Status": "Enabled",
            "Expiration": {
                "Days": 1
            }
        }]
    }' 2>/dev/null || echo -e "${YELLOW}⚠ Failed to set lifecycle policy${NC}"

# Set CORS configuration
aws s3api put-bucket-cors \
    --bucket ${BUCKET_NAME} \
    --cors-configuration '{
        "CORSRules": [{
            "AllowedHeaders": ["*"],
            "AllowedMethods": ["GET", "PUT", "POST"],
            "AllowedOrigins": ["http://localhost:3000", "https://*"],
            "ExposeHeaders": ["ETag"]
        }]
    }' 2>/dev/null || echo -e "${YELLOW}⚠ Failed to set CORS${NC}"

echo ""
echo "📊 Creating DynamoDB Tables..."
echo "============================="

# Create main sessions table
if aws dynamodb create-table \
    --table-name ${TABLE_NAME} \
    --attribute-definitions \
        AttributeName=sessionId,AttributeType=S \
        AttributeName=timestamp,AttributeType=N \
    --key-schema \
        AttributeName=sessionId,KeyType=HASH \
        AttributeName=timestamp,KeyType=RANGE \
    --billing-mode PAY_PER_REQUEST \
    --region ${REGION} 2>/dev/null; then
    echo -e "${GREEN}✓ DynamoDB table created: ${TABLE_NAME}${NC}"
else
    echo -e "${YELLOW}⚠ DynamoDB table creation failed or already exists${NC}"
fi

# Enable TTL on sessions table
aws dynamodb update-time-to-live \
    --table-name ${TABLE_NAME} \
    --time-to-live-specification \
        Enabled=true,AttributeName=ttl \
    --region ${REGION} 2>/dev/null || echo -e "${YELLOW}⚠ Failed to enable TTL${NC}"

# Create analytics table
if aws dynamodb create-table \
    --table-name ${ANALYTICS_TABLE_NAME} \
    --attribute-definitions \
        AttributeName=id,AttributeType=S \
        AttributeName=date,AttributeType=S \
    --key-schema \
        AttributeName=id,KeyType=HASH \
    --global-secondary-indexes \
        IndexName=DateIndex,Keys=["{AttributeName=date,KeyType=HASH}"],Projection="{ProjectionType=ALL}" \
    --billing-mode PAY_PER_REQUEST \
    --region ${REGION} 2>/dev/null; then
    echo -e "${GREEN}✓ Analytics table created: ${ANALYTICS_TABLE_NAME}${NC}"
else
    echo -e "${YELLOW}⚠ Analytics table creation failed or already exists${NC}"
fi

echo ""
echo "📝 Creating CloudWatch Log Group..."
echo "==================================="

# Create CloudWatch log group
if aws logs create-log-group \
    --log-group-name /aws/tenth-opinion/api \
    --region ${REGION} 2>/dev/null; then
    echo -e "${GREEN}✓ CloudWatch log group created${NC}"
else
    echo -e "${YELLOW}⚠ Log group creation failed or already exists${NC}"
fi

# Set retention
aws logs put-retention-policy \
    --log-group-name /aws/tenth-opinion/api \
    --retention-in-days 7 \
    --region ${REGION} 2>/dev/null || echo -e "${YELLOW}⚠ Failed to set retention${NC}"

echo ""
echo "🔍 Checking Bedrock Model Access..."
echo "==================================="

# Check if Bedrock models are accessible
if aws bedrock list-foundation-models --region ${REGION} &>/dev/null; then
    echo -e "${GREEN}✓ Bedrock API is accessible${NC}"
    
    # Check for specific models
    MODELS=("anthropic.claude-opus-4-20250514-v1:0" "anthropic.claude-sonnet-4-20250514-v1:0" "anthropic.claude-3-5-haiku-20240307")
    
    echo ""
    echo "Checking model access:"
    for MODEL in "${MODELS[@]}"; do
        # Note: This is a simplified check. You may need to actually invoke the model to verify access
        echo -e "${YELLOW}  → ${MODEL} (manual verification required)${NC}"
    done
    
    echo ""
    echo -e "${YELLOW}⚠ Please ensure you have enabled access to Claude models in the Bedrock console:${NC}"
    echo -e "${YELLOW}  https://console.aws.amazon.com/bedrock/home#/model-access${NC}"
else
    echo -e "${RED}✗ Cannot access Bedrock API. Please check your permissions.${NC}"
fi

echo ""
echo "📋 Creating .env file..."
echo "========================"

# Create .env file with the generated values
cat > .env << EOF
# AWS Configuration
AWS_REGION=${REGION}
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here

# S3 Configuration
S3_BUCKET_NAME=${BUCKET_NAME}

# DynamoDB Configuration
DYNAMODB_TABLE_NAME=${TABLE_NAME}

# CloudWatch Configuration
CLOUDWATCH_LOG_GROUP=/aws/tenth-opinion/api

# Development Settings
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:3000

# Feature Flags
ENABLE_MOCK_DATA=true
ENABLE_EXPERT_INJECTION=true
ENABLE_CONTINUOUS_LEARNING=true
MAX_DAILY_REQUESTS=100
EOF

echo -e "${GREEN}✓ Created .env file with configuration${NC}"
echo -e "${YELLOW}⚠ Remember to update AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in .env${NC}"

echo ""
echo "🎉 Setup Complete!"
echo "=================="
echo ""
echo "Resources created:"
echo -e "  • S3 Bucket: ${GREEN}${BUCKET_NAME}${NC}"
echo -e "  • DynamoDB Table: ${GREEN}${TABLE_NAME}${NC}"
echo -e "  • Analytics Table: ${GREEN}${ANALYTICS_TABLE_NAME}${NC}"
echo -e "  • CloudWatch Logs: ${GREEN}/aws/tenth-opinion/api${NC}"
echo ""
echo "Next steps:"
echo "1. Update your .env file with your AWS credentials"
echo "2. Enable Claude models in Bedrock console if not already done"
echo "3. Run 'bun install' to install dependencies"
echo "4. Run 'bun dev' to start the development server"
echo ""
echo -e "${GREEN}Happy coding! 🚀${NC}"
