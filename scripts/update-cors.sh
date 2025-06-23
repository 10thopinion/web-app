#!/bin/bash

# Update S3 CORS Configuration Script
# This script updates the CORS configuration for the S3 bucket

set -e

echo "🔄 Updating S3 CORS Configuration..."
echo "===================================="

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

# Get bucket name from .env or environment
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

if [ -z "$S3_BUCKET_NAME" ]; then
    echo -e "${RED}S3_BUCKET_NAME not found in environment.${NC}"
    echo "Please set S3_BUCKET_NAME or ensure it's in your .env file"
    exit 1
fi

echo -e "${GREEN}Updating CORS for bucket: $S3_BUCKET_NAME${NC}"

# Update CORS configuration with all domains
aws s3api put-bucket-cors \
    --bucket ${S3_BUCKET_NAME} \
    --cors-configuration '{
        "CORSRules": [{
            "AllowedHeaders": ["*"],
            "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
            "AllowedOrigins": [
                "http://localhost:3000",
                "https://10thopinion.com",
                "https://www.10thopinion.com",
                "https://10thopinion.vercel.app",
                "https://*.vercel.app"
            ],
            "ExposeHeaders": ["ETag"],
            "MaxAgeSeconds": 3000
        }]
    }'

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ CORS configuration updated successfully!${NC}"
    echo ""
    echo "Allowed origins:"
    echo "  • http://localhost:3000 (development)"
    echo "  • https://10thopinion.com"
    echo "  • https://www.10thopinion.com"
    echo "  • https://10thopinion.vercel.app"
    echo "  • https://*.vercel.app (all Vercel preview deployments)"
else
    echo -e "${RED}✗ Failed to update CORS configuration${NC}"
    exit 1
fi

# Verify the configuration
echo ""
echo "Verifying CORS configuration..."
aws s3api get-bucket-cors --bucket ${S3_BUCKET_NAME} --output json | jq '.CORSRules[0].AllowedOrigins'

echo ""
echo -e "${GREEN}🎉 CORS update complete!${NC}"