# Tenth Opinion Protocol - Medical AI Analysis System

## 🚀 Overview
A revolutionary multi-agent AI system that provides comprehensive medical analysis through 10 specialized AI opinions using AWS Bedrock's latest Claude 4 models.

## 🏆 AWS Breaking Barriers Hackathon Submission
This project demonstrates how AWS generative AI services combined with next-generation connectivity can solve pressing healthcare challenges by:
- Democratizing access to expert medical opinions
- Reducing diagnostic errors through multi-agent consensus
- Providing equitable healthcare insights regardless of location
- Enabling real-time medical image analysis

## 🔧 Technology Stack
- **Frontend**: Next.js 15.3, React 19.1, TypeScript, Tailwind CSS v4
- **AI Models**: AWS Bedrock (Claude 4 Opus/Sonnet)
- **Cloud Services**: AWS S3, DynamoDB, Lambda, SageMaker
- **Runtime**: Bun 1.2.15

## 📋 Prerequisites
- AWS Account with Bedrock access
- Node.js 18+ or Bun
- AWS credentials configured

## 🛠️ AWS Setup Required

### 1. Enable Amazon Bedrock Models
1. Go to AWS Console → Amazon Bedrock
2. Navigate to "Model access"
3. Enable the following models:
   - Claude Opus 4 (anthropic.claude-opus-4-20250515)
   - Claude Sonnet 4 (anthropic.claude-sonnet-4-20250515)
   - Claude 3.5 Haiku (for scrutinizer agents)

### 2. Create S3 Bucket (for image uploads)
```bash
aws s3 mb s3://tenth-opinion-medical-images --region us-east-1
```

### 3. Set up DynamoDB Table (for session storage)
```bash
aws dynamodb create-table \
  --table-name TenthOpinionSessions \
  --attribute-definitions AttributeName=sessionId,AttributeType=S \
  --key-schema AttributeName=sessionId,KeyType=HASH \
  --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 \
  --region us-east-1
```

### 4. Environment Variables
Update your `.env` file with:
```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
S3_BUCKET_NAME=tenth-opinion-medical-images
DYNAMODB_TABLE_NAME=TenthOpinionSessions
```

## 🚀 Installation & Running

```bash
# Install dependencies
bun install

# Run development server
bun dev

# Build for production
bun run build

# Start production server
bun start
```

## 🏗️ Architecture

### Agent Types
1. **Blind Diagnosticians (1-4)**: Independent analysis without seeing other opinions
   - First Opinion: Pattern Recognition
   - Second Opinion: Differential Diagnosis
   - Third Opinion: Rare Disease Specialist
   - Fourth Opinion: Holistic Assessment

2. **Informed Analysts (5-7)**: Sequential review with access to previous opinions
   - Fifth Opinion: Consensus Builder
   - Sixth Opinion: Devil's Advocate
   - Seventh Opinion: Evidence Validator

3. **Scrutinizers (8-9)**: Quality control and bias detection
   - Eighth Opinion: Hallucination Detector
   - Ninth Opinion: Bias Auditor

4. **Final Authority (10)**: Weighted synthesis of all opinions

### Key Features
- 📱 Mobile-responsive design with photo upload
- 🌓 Light/dark mode with accessible color scheme
- 🔒 HIPAA-compliant data handling
- ⚡ Real-time agent visualization
- 📊 Comprehensive diagnostic reports
- 🚨 Expert trigger for low-confidence cases

## 🔒 Security & Privacy
- All data is encrypted in transit and at rest
- No personal information is permanently stored
- Session data expires after 24 hours
- Compliant with healthcare data regulations

## 📝 API Documentation

### POST /api/analyze
Submit patient data for analysis

**Request Body:**
```json
{
  "symptoms": ["headache", "fever"],
  "description": "Detailed symptom description",
  "medicalHistory": "Previous conditions",
  "medications": ["medication1"],
  "allergies": ["allergy1"],
  "age": 30,
  "biologicalSex": "male",
  "images": []
}
```

**Response:**
```json
{
  "success": true,
  "results": {
    "agent-1": { ... },
    "agent-2": { ... },
    // ... all 10 agents
  },
  "timestamp": "2025-06-21T..."
}
```

## 🧪 Testing
For testing without AWS credentials, the app includes a demo mode with simulated responses.

## 🤝 Contributing
This is a hackathon project demonstrating the potential of multi-agent AI in healthcare. Contributions and suggestions are welcome!

## ⚠️ Medical Disclaimer
This AI system is for informational purposes only and should not replace professional medical advice, diagnosis, or treatment. Always consult qualified healthcare providers for medical concerns.

## 📄 License
MIT License - See LICENSE file for details

## 🏅 Hackathon Requirements Met
- ✅ Uses AWS Bedrock generative AI services
- ✅ Demonstrates measurable real-world impact in healthcare
- ✅ Clean, intuitive user interface
- ✅ Technically sound and well-engineered
- ✅ Mobile-friendly with image upload
- ✅ Addresses healthcare accessibility challenges
