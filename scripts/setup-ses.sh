#!/bin/bash

# Tenth Opinion Protocol - AWS SES Setup Script
# This script sets up AWS SES for email delivery

set -e

echo "📧 Setting up AWS SES for Tenth Opinion Protocol..."
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

# Get AWS region
REGION=$(aws configure get region)
echo -e "${GREEN}AWS Region: $REGION${NC}"

echo ""
echo "📧 Setting up SES..."
echo "===================="

# Verify sender email
read -p "Enter the email address to verify for sending (e.g., noreply@yourdomain.com): " SENDER_EMAIL

if [ -z "$SENDER_EMAIL" ]; then
    echo -e "${RED}Email address is required${NC}"
    exit 1
fi

# Verify email identity
echo "Verifying email identity..."
if aws ses verify-email-identity --email-address ${SENDER_EMAIL} --region ${REGION}; then
    echo -e "${GREEN}✓ Verification email sent to ${SENDER_EMAIL}${NC}"
    echo -e "${YELLOW}⚠ Please check your email and click the verification link${NC}"
else
    echo -e "${YELLOW}⚠ Email verification failed or already verified${NC}"
fi

# Check verification status
echo ""
echo "Checking verification status..."
VERIFIED=$(aws ses list-identities --identity-type EmailAddress --region ${REGION} --query "Identities[?contains(@, '${SENDER_EMAIL}')] | [0]" --output text)

if [ "$VERIFIED" = "$SENDER_EMAIL" ]; then
    echo -e "${GREEN}✓ Email ${SENDER_EMAIL} is verified${NC}"
else
    echo -e "${YELLOW}⚠ Email not yet verified. Please check your inbox and verify before sending emails.${NC}"
fi

# Create configuration set for tracking
echo ""
echo "Creating SES configuration set..."
CONFIG_SET_NAME="tenth-opinion-emails"

if aws ses put-configuration-set --configuration-set Name=${CONFIG_SET_NAME} --region ${REGION} 2>/dev/null; then
    echo -e "${GREEN}✓ Configuration set created: ${CONFIG_SET_NAME}${NC}"
else
    echo -e "${YELLOW}⚠ Configuration set already exists or creation failed${NC}"
fi

# Enable event publishing (optional - for tracking bounces, complaints)
aws ses put-configuration-set-event-destination \
    --configuration-set-name ${CONFIG_SET_NAME} \
    --event-destination Name=cloudwatch-event-destination \
    Enabled=true \
    CloudWatchDestination='{
        "DimensionConfigurations": [{
            "DimensionName": "MessageTag",
            "DimensionValueSource": "messageTag",
            "DefaultDimensionValue": "none"
        }]
    }' \
    --region ${REGION} 2>/dev/null || echo -e "${YELLOW}⚠ Failed to set event destination${NC}"

echo ""
echo "📋 Updating .env file..."
echo "========================"

# Check if .env exists
if [ -f ".env" ]; then
    # Add SES configuration if not already present
    if ! grep -q "AWS_SES_FROM_EMAIL" .env; then
        cat >> .env << EOF

# AWS SES Configuration
AWS_SES_FROM_EMAIL=${SENDER_EMAIL}
AWS_SES_REGION=${REGION}
AWS_SES_CONFIG_SET=${CONFIG_SET_NAME}
EOF
        echo -e "${GREEN}✓ Added SES configuration to .env${NC}"
    else
        echo -e "${YELLOW}⚠ SES configuration already exists in .env${NC}"
    fi
else
    echo -e "${RED}✗ .env file not found. Please run setup-aws.sh first${NC}"
fi

echo ""
echo "🎉 SES Setup Complete!"
echo "======================"
echo ""
echo "Next steps:"
echo "1. Verify your email address by clicking the link in the verification email"
echo "2. Request production access if needed (currently in sandbox mode)"
echo "   - In sandbox: Can only send to verified emails"
echo "   - Production: Can send to any email"
echo "3. To request production access:"
echo "   aws ses put-account-sending-attributes --production-access-enabled"
echo ""
echo "Current sending limits (sandbox):"
aws ses describe-configuration-set --configuration-set-name default --region ${REGION} 2>/dev/null || true
echo ""
echo -e "${GREEN}Email setup complete! 📧${NC}"