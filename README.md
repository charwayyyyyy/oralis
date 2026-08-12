<div align="center">
  <img src="/public/oralis-logo.png" alt="Oralis Logo" width="180" height="auto" style="border-radius: 16px; box-shadow: 0 10px 30px rgba(10,18,48,0.3);" />
  
  # ORALIS
  ### *A Living Atlas of Human Cultural Memory & Endangered Language Preservation*

  <p align="center">
    <strong>"Every language carries a world. Oralis helps speakers, families and communities preserve pronunciations, stories and cultural knowledge in their own voices."</strong>
  </p>

  <p align="center">
    <a href="#-overview">Overview</a> •
    <a href="#-visual-system--modes">Design System</a> •
    <a href="#-architecture--cloud-infrastructure">Architecture</a> •
    <a href="#-api-reference">API Catalog</a> •
    <a href="#-community-stewardship--licensing">Governance</a> •
    <a href="#-getting-started">Setup</a>
  </p>
</div>

---

## 📚 Overview

**Oralis** is a production-ready, cloud-native cultural preservation platform built to safeguard endangered languages and living oral traditions. Rather than treating languages as static museum artefacts, Oralis provides an interactive, living archive where native speakers, families, and cultural guardians record pronunciations, oral histories, and cultural context in their authentic voices.

### Core Value Pillars
- **Voice Over Text**: Audio is the primary, irreplaceable carrier of linguistic nuance, inflection, and cultural spirit.
- **No-Account Stewardship**: Contributors retain absolute ownership of their cultural memories through cryptographic delete tokens—no invasive accounts, tracking, or passwords required.
- **Informed Community Consent**: All archives operate with elder permission and respect for cultural boundaries under open cultural licensing (**Creative Commons Attribution 4.0 International**).

---

## 🎨 Visual System & Modes

The interface pairs atmospheric editorial cartography with tactile functional surfaces:

1. **Inverted Mask / Voice Portal**:
   - Central visual moment symbolizing living voices emerging from silence.
   - The archival outer layer softly desaturates into a graticule grid, while the central aperture reveals warm spectral waveforms, gold vitality energy, and ancient writing systems (Akan, Ainu, Mayan, Ge'ez, Inuktitut).
2. **Layered Typography Behind Objects**:
   - Oversized editorial words (`VOICE`, `MEMORY`, `ATLAS`, `COVENANT`) anchored subtly in the background with `aria-hidden="true"` behind interactive cards and maps.
3. **iOS-Core Functional Surfaces**:
   - Tactile segmented filters with spring transitions.
   - Status capsules, minimum 44×44px touch targets, and focus-ring accessibility.
   - Determinate upload progress and copy feedback toasts.
4. **Ethereal Cultural Atmosphere**:
   - Curated palette of Navy Abyss (`#0A1230`), Brand Navy (`#1B2A5E`), Warm Gold (`#C8A96B`), Pale Gold (`#E8D5A8`), Ivory (`#F7F4EE`), and Natural Stone (`#8A7968`).
   - Accessible reduced-motion static fallback modes (`@media (prefers-reduced-motion: reduce)`).

---

## 🏗️ Architecture & Cloud Infrastructure

Oralis is architected around a single-table DynamoDB design, S3 presigned direct uploads, and Next.js App Router serverless endpoints.

```
┌────────────────────────────────────────────────────────────────────────┐
│                          Next.js App Router                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌────────────┐  │
│  │   /explore   │  │ /contribute  │  │ /observatory │  │  /profile  │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  └────────────┘  │
│                           │                  │                         │
│                    Serverless API Routes     │                         │
│                           │                  │                         │
└───────────────────────────┼──────────────────┼─────────────────────────┘
                            ▼                  ▼
              ┌────────────────────────┐  ┌────────────────────────┐
              │      AWS DynamoDB      │  │         AWS S3         │
              │  (`oralis-production`) │  │ (`oralis-media-prod`)  │
              │   Single-Table Schema  │  │  Presigned Audio Media │
              └────────────────────────┘  └────────────────────────┘
```

### DynamoDB Single-Table Schema (`oralis-production`)

| Entity | PK | SK | GSI1PK | GSI1SK | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Language Meta** | `LANGUAGE#<id>` | `META` | `ALL_LANGUAGES` / `<continent>` | `<vitalityScore>` | Core language metadata, speaker counts, counters |
| **Contribution** | `LANGUAGE#<id>` | `CONTRIBUTION#<ISO>#<nanoid>` | `FEED` | `<ISO>` | Preserved phrase/audio record with delete token |
| **Registration** | `NEWLANG#<ISO>` | `REG#<email>` | `PENDING_REVIEW` | `<ISO>` | Community language submission review queue |

### Audio Upload Lifecycle
1. **Presigned S3 POST**: Client requests a signed policy from `/api/upload-url`, enforcing a strict 10 MB size limit and audio MIME type.
2. **Direct Browser Upload**: Audio blob streams directly from the user's browser to S3 bucket `oralis-media-prod-001`.
3. **Signed Download URL**: Playback streams via presigned GET URLs generated on demand.

---

## 🔌 API Reference

| Method | Route | Description |
| :--- | :--- | :--- |
| `POST` | `/api/upload-url` | Generate S3 presigned POST policy (10 MB limit) |
| `POST` | `/api/upload-audio` | Direct multipart audio upload fallback |
| `GET` | `/api/languages` | Retrieve language list with fallback |
| `POST` | `/api/languages` | Submit unindexed language for review |
| `GET` | `/api/language/list` | Read-optimized language list with contribution tallies |
| `GET` | `/api/language/full?id=<id>` | Language profile and associated contributions |
| `POST` | `/api/language/create` | Create or update a language metadata record |
| `GET` | `/api/feed?limit=20&cursor=<base64>` | Global chronological contribution feed (GSI1) |
| `POST` | `/api/contribution/create` | Store contribution, generate delete token, increment counters |
| `GET` | `/api/contribution/find-by-token?token=<uuid>` | Look up contribution metadata by delete secret |
| `DELETE` | `/api/contribution/delete?PK=<pk>&SK=<sk>&token=<uuid>` | Permanently delete contribution from DynamoDB & S3 |

---

## 🤝 Community Stewardship & Licensing

- **Open Licensing**: All contributions are published under [Creative Commons Attribution 4.0 International (CC BY 4.0)](https://creativecommons.org/licenses/by/4.0/).
- **No Commercial Exploitation**: Oralis does not sell or paywall cultural knowledge.
- **Informed Consent**: Contributions require explicit speaker agreement; secret or sacred ceremonial traditions are excluded.
- **Cryptographic Right of Erasure**: Contributors retain permanent deletion rights at any time via the `/profile` tool.

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 20+
- AWS Account with DynamoDB and S3 bucket configured

### 2. Installation
```bash
git clone https://github.com/charwayyyyyy/oralis.git
cd oralis
npm install
```

### 3. Environment Configuration
Create a `.env.local` file in the root directory:
```env
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
DYNAMODB_TABLE=oralis-production
S3_BUCKET=oralis-media-prod-001
```

### 4. Development & Verification
```bash
# Start local dev server
npm run dev

# Run TypeScript checks
npm run lint

# Production build test
npm run build
```

---

<div align="center">
  <p>Built with reverence for human heritage by <strong><a href="https://github.com/charwayyyyyy">charwayyyyyy</a></strong> &middot; &copy; 2026 Oralis</p>
</div>
