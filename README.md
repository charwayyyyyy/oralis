# ORALIS – Endangered Language Preservation Platform

## 📚 Overview
ORALIS is a modern, production‑grade web application that enables communities to **create, record, and explore endangered languages**. The platform stores language metadata in **AWS DynamoDB** and audio recordings in **AWS S3**, providing a scalable, globally‑available knowledge layer for language preservation.

## 🎯 Core Features
- **Language Management** – Create new language entries, edit metadata, and view a searchable list.
- **Contribution Wizard** – Record text and audio contributions in‑browser and upload them directly to S3.
- **Observatory (Read‑Optimised)** – Public view of all languages with real‑time contribution counts, audio playback, and cultural context.
- **Global Navigation** – Persistent navigation bar and footer with links to Home, Explore, Observatory, Insights, and Profile.

## 🏗️ Architecture
The system follows a **single‑table DynamoDB design** combined with serverless API routes inside a **Next.js (App Router) application**. All backend logic lives in the same Next.js code‑base, leveraging the **AWS SDK v3** for DynamoDB and S3 interactions.

### Component Diagram
![ORALIS Architecture Diagram](/architecture.png)

#### Front‑end (Next.js React)
- **Navigation** – Global nav bar present on every page.
- **Observatory** – Lists languages with contribution counts and audio playback.
- **LanguageDetail** – Detailed page for a single language.
- **ContributionWizard** – Guided UI for recording and uploading contributions.
- **Footer** – Persistent footer with branding and GitHub link.

#### Back‑end (Next.js API Routes)
- `GET /api/language/list` – Retrieves languages with contribution counts.
- `POST /api/language/create` – Persists new language metadata.
- `POST /api/contribution/create` – Stores contribution records.
- `POST /api/upload-audio` – Streams audio files directly to S3.

#### Cloud (AWS)
- **DynamoDB (`oralis-production`)** – Stores language metadata, contribution records, and GSI for feeds.
- **S3 (`oralis-media-prod-001`)** – Holds audio files; public read enabled for playback.
- **IAM Role** – Grants `AmazonDynamoDBFullAccess` and `AmazonS3FullAccess` to the Lambda‑style functions.
- **AWS SDK v3** – Used in the serverless functions to interact with DynamoDB and S3.

### Operational Excellence
- **Security** – IAM least‑privilege, S3 bucket policy limiting `GetObject` to public reads only, DynamoDB encryption at rest.
- **Performance** – DynamoDB on‑demand billing, query‑optimized GSI for feed, CDN (Next.js static export) for assets.
- **Reliability** – Multi‑AZ DynamoDB, automatic S3 replication, graceful error handling in API routes.
- **Cost Optimization** – On‑demand DynamoDB scales with usage, S3 Standard tier for audio storage, serverless API routes incur cost only per request.
- **Monitoring** – CloudWatch metrics for DynamoDB read/write units and S3 request counts.

## 🚀 Getting Started (Development)
```bash
# Clone the repo
git clone <repo-url>
cd oralis

# Install dependencies
npm install

# Set up environment variables (copy .env.example to .env.local)
cp .env.example .env.local
# Edit .env.local with your AWS credentials, region, and table/bucket names

# Run the dev server
npm run dev
```
The app will be available at `http://localhost:3000`.

## 📦 Deployment
Deploy with Vercel or any platform that supports Next.js serverless functions. Ensure the following environment variables are configured in the deployment environment:
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION`
- `DYNAMODB_TABLE=oralis-production`
- `S3_BUCKET=oralis-media-prod-001`

---
*Built by* **[charwayyyyyy](https://github.com/charwayyyyyy)** © 2026
