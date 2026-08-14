export type VitalityStatus = 'safe' | 'vulnerable' | 'endangered' | 'critically-endangered' | 'dormant'

export type ModerationStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'HIDDEN'
  | 'ARCHIVED'
  | 'DELETION_PENDING'

export interface ModerationMetadata {
  moderationStatus?: ModerationStatus
  moderationVersion?: number
  visibility?: 'PUBLIC' | 'ADMIN_ONLY'
  submittedAt?: string
  reviewedAt?: string
  reviewedBy?: string
  reviewReason?: string
  deletedAt?: string
  deletedBy?: string
  deletionReason?: string
  restoredAt?: string
  restoredBy?: string
  schemaVersion?: number
}

export interface Language extends ModerationMetadata {
  id: string
  name: string
  nativeName: string
  region: string
  country: string
  continent: string
  speakers: number
  status: VitalityStatus | string
  vitalityStatus?: VitalityStatus
  vitalityScore: number
  audioCount: number
  storiesArchived: number
  contributors: number
  lastContribution?: string
  description: string
  family?: string
  iso?: string
  lat?: number
  lon?: number
  tags?: string[]
  featuredPhrase?: { text: string; translation: string; phonetic: string }
  contributorName?: string
  contributorEmail?: string
  contributorRole?: string
  contributorLocation?: string
  contributorRelationship?: string
  contributorBio?: string
  sources?: string
  consent?: boolean
  createdAt?: string
  updatedAt?: string
  editedMetadata?: Record<string, unknown>
  adminNotes?: string
  PK?: string
  SK?: string
  GSI1PK?: string
  GSI1SK?: string | number
}

export interface Contribution extends ModerationMetadata {
  id: string
  PK?: string
  SK?: string
  languageId: string
  languageName?: string
  type?: 'vocabulary' | 'audio' | 'story' | 'cultural-context' | 'phrase'
  title?: string
  body?: string
  context?: string
  source?: string
  location?: string
  audioS3Key?: string
  s3Key?: string
  audioUrl?: string
  audioDuration?: number
  audioSizeBytes?: number
  audioMimeType?: string
  contributor?: string
  contributorName?: string
  date?: string
  createdAt?: string
  updatedAt?: string
  verified?: boolean
  excerpt?: string
  deleteToken?: string
  reportCount?: number
  GSI1PK?: string
  GSI1SK?: string | number
}

export interface Contributor {
  id: string
  name: string
  location: string
  languages: string[]
  contributions: number
  reputationScore: number
  verifiedCount: number
  joinDate: string
  bio: string
}

export type ReportReason =
  | 'incorrect-info'
  | 'no-consent'
  | 'offensive'
  | 'spam'
  | 'duplicate'
  | 'audio-mismatch'
  | 'other'

export interface ContentReport {
  id: string
  targetType: 'contribution' | 'language'
  targetId: string
  targetPK: string
  targetSK: string
  targetTitle?: string
  languageId?: string
  languageName?: string
  reason: ReportReason
  explanation?: string
  reporterIpHash?: string
  contributorDeviceId?: string
  status: 'OPEN' | 'RESOLVED' | 'DISMISSED'
  createdAt: string
  resolvedAt?: string
  resolvedBy?: string
  resolutionAction?: string
  resolutionNotes?: string
}

export interface AuditLogEntry {
  id: string
  action: string
  entityType: 'language' | 'contribution' | 'report' | 'metadata' | 'reconciliation'
  entityId: string
  entityKey: { PK: string; SK: string }
  actorId: string
  actorRole: string
  previousState?: Record<string, unknown>
  newState?: Record<string, unknown>
  reason?: string
  metadata?: Record<string, unknown>
  timestamp: string
}

export interface AnalyticsTotals {
  totalLanguages: number
  pendingLanguages: number
  approvedLanguages: number
  rejectedLanguages: number
  hiddenLanguages: number
  archivedLanguages: number
  totalContributions: number
  pendingContributions: number
  approvedContributions: number
  rejectedContributions: number
  hiddenContributions: number
  archivedContributions: number
  audioContributions: number
  storyContributions: number
  vocabularyContributions: number
  culturalContextContributions: number
  uniqueContributorDevices: number
  activeContributorsToday: number
  activeContributorsThisWeek: number
  openReports: number
  resolvedReports: number
  approvalRate: number
  medianReviewTimeMinutes: number
  lastUpdated: string
}

export const LANGUAGES: Language[] = [
  {
    id: 'ainu',
    name: 'Ainu',
    nativeName: 'アイヌ・イタㇰ',
    region: 'Hokkaido',
    country: 'Japan',
    continent: 'Asia',
    speakers: 10,
    status: 'critically-endangered',
    vitalityStatus: 'critically-endangered',
    vitalityScore: 8,
    audioCount: 342,
    storiesArchived: 87,
    contributors: 23,
    lastContribution: '2 hours ago',
    description:
      'Ainu is the language of the indigenous Ainu people of Hokkaido, Japan. Once spoken across a vast region, it now has fewer than ten fluent native speakers, making it one of the most critically endangered languages in East Asia.',
    family: 'Ainu language isolate',
    iso: 'ain',
    lat: 43.06,
    lon: 141.35,
    tags: ['isolate', 'oral tradition', 'polysynthetic'],
    featuredPhrase: {
      text: 'Inkar an yan',
      translation: 'Please look at me',
      phonetic: '/iŋkar an jan/',
    },
    moderationStatus: 'APPROVED',
    visibility: 'PUBLIC',
  },
  {
    id: 'tzeltal',
    name: 'Tzeltal',
    nativeName: "Bats'il k'op",
    region: 'Chiapas',
    country: 'Mexico',
    continent: 'Americas',
    speakers: 589000,
    status: 'vulnerable',
    vitalityStatus: 'vulnerable',
    vitalityScore: 62,
    audioCount: 1247,
    storiesArchived: 304,
    contributors: 156,
    lastContribution: '14 minutes ago',
    description:
      'Tzeltal is a Mayan language spoken in the highlands of Chiapas, Mexico. It is one of the larger indigenous languages of Mexico with a rich oral literary tradition, including elaborate narrative poetry and ceremonial speech.',
    family: 'Mayan',
    iso: 'tzh',
    lat: 16.75,
    lon: -92.63,
    tags: ['mayan', 'tonal', 'agglutinative', 'oral poetry'],
    featuredPhrase: {
      text: 'Lek ayotik',
      translation: 'We are well',
      phonetic: "/lek a'jotik/",
    },
    moderationStatus: 'APPROVED',
    visibility: 'PUBLIC',
  },
  {
    id: 'livonian',
    name: 'Livonian',
    nativeName: 'Līvõ kēļ',
    region: 'Courland',
    country: 'Latvia',
    continent: 'Europe',
    speakers: 20,
    status: 'critically-endangered',
    vitalityStatus: 'critically-endangered',
    vitalityScore: 12,
    audioCount: 189,
    storiesArchived: 45,
    contributors: 11,
    lastContribution: '3 days ago',
    description:
      'Livonian is a Finnic language indigenous to the Livonian Coast of Latvia. The last native speaker passed away in 2013, but a small community of second-language speakers and activists are actively revitalizing the language through youth education and cultural documentation.',
    family: 'Uralic > Finnic',
    iso: 'liv',
    lat: 57.65,
    lon: 22.3,
    tags: ['finnic', 'revitalizing', 'baltic', 'tonal'],
    featuredPhrase: {
      text: 'Tēriņtš!',
      translation: 'Hello! (lit. be healthy)',
      phonetic: '/teːriɲtʃ/',
    },
    moderationStatus: 'APPROVED',
    visibility: 'PUBLIC',
  },
  {
    id: 'khmer-krom',
    name: 'Khmer Krom',
    nativeName: 'ភាសាខ្មែរក្រោម',
    region: 'Mekong Delta',
    country: 'Vietnam',
    continent: 'Asia',
    speakers: 1300000,
    status: 'vulnerable',
    vitalityStatus: 'vulnerable',
    vitalityScore: 58,
    audioCount: 890,
    storiesArchived: 210,
    contributors: 89,
    lastContribution: '6 hours ago',
    description:
      'Khmer Krom is the variety of Khmer spoken by the indigenous Khmer people of the Mekong Delta region in southern Vietnam. It preserves distinct phonetic and lexical features no longer common in standard Cambodian Khmer.',
    family: 'Austroasiatic > Mon-Khmer',
    iso: 'khm',
    lat: 9.8,
    lon: 105.8,
    tags: ['mon-khmer', 'non-tonal', 'mekong', 'oral history'],
    featuredPhrase: {
      text: 'ជំរាបសួរ',
      translation: 'Respectful greeting',
      phonetic: '/cumriəp suə/',
    },
    moderationStatus: 'APPROVED',
    visibility: 'PUBLIC',
  },
  {
    id: 'yuchi',
    name: 'Yuchi',
    nativeName: 'Yugyaha',
    region: 'Oklahoma',
    country: 'United States',
    continent: 'Americas',
    speakers: 4,
    status: 'critically-endangered',
    vitalityStatus: 'critically-endangered',
    vitalityScore: 5,
    audioCount: 612,
    storiesArchived: 143,
    contributors: 18,
    lastContribution: '1 day ago',
    description:
      'Yuchi is a language isolate indigenous to the Southeastern United States, now centered in Oklahoma following forced removal. A dedicated community language project has produced new fluent speakers through immersion programs.',
    family: 'Language isolate',
    iso: 'yuc',
    lat: 35.8,
    lon: -96.1,
    tags: ['isolate', 'immersion revitalization', 'indigenous american'],
    featuredPhrase: {
      text: "Dzo'k'a-k'ala",
      translation: 'Let us all speak',
      phonetic: "/dzoʔkʼa kʼala/",
    },
    moderationStatus: 'APPROVED',
    visibility: 'PUBLIC',
  },
  {
    id: 'cornish',
    name: 'Cornish',
    nativeName: 'Kernewek',
    region: 'Cornwall',
    country: 'United Kingdom',
    continent: 'Europe',
    speakers: 500,
    status: 'endangered',
    vitalityStatus: 'endangered',
    vitalityScore: 28,
    audioCount: 756,
    storiesArchived: 198,
    contributors: 67,
    lastContribution: '5 hours ago',
    description:
      'Cornish is a Southwestern Brittonic Celtic language formerly spoken in Cornwall. After declining in the 18th century, it has undergone a remarkable revitalization movement with hundreds of fluent speakers and growing numbers of bilingual children.',
    family: 'Indo-European > Celtic > Brythonic',
    iso: 'cor',
    lat: 50.26,
    lon: -5.05,
    tags: ['celtic', 'brythonic', 'revived', 'european minority'],
    featuredPhrase: {
      text: 'Myttin da',
      translation: 'Good morning',
      phonetic: '/mɪtɪn daː/',
    },
    moderationStatus: 'APPROVED',
    visibility: 'PUBLIC',
  },
  {
    id: 'mapudungun',
    name: 'Mapudungun',
    nativeName: 'Mapudungun',
    region: 'Araucanía & Biobío',
    country: 'Chile & Argentina',
    continent: 'Americas',
    speakers: 250000,
    status: 'endangered',
    vitalityStatus: 'endangered',
    vitalityScore: 41,
    audioCount: 1540,
    storiesArchived: 420,
    contributors: 112,
    lastContribution: '45 minutes ago',
    description:
      'Mapudungun is the language of the Mapuche people of south-central Chile and southwestern Argentina. It has a deeply rich oral history (epew, nütram) that connects ecological knowledge, spiritual philosophy, and territorial memory.',
    family: 'Araucanian language isolate/family',
    iso: 'arn',
    lat: -38.74,
    lon: -72.59,
    tags: ['araucanian', 'polysynthetic', 'indigenous south american', 'oral history'],
    featuredPhrase: {
      text: 'Mari mari kom pu che',
      translation: 'Greetings to all people',
      phonetic: '/maɾi maɾi kom pu tʃe/',
    },
    moderationStatus: 'APPROVED',
    visibility: 'PUBLIC',
  },
  {
    id: 'tlingit',
    name: 'Tlingit',
    nativeName: 'Lingít Yoo X̲ʼatángi',
    region: 'Southeast Alaska',
    country: 'United States & Canada',
    continent: 'Americas',
    speakers: 80,
    status: 'critically-endangered',
    vitalityStatus: 'critically-endangered',
    vitalityScore: 16,
    audioCount: 423,
    storiesArchived: 115,
    contributors: 34,
    lastContribution: '8 hours ago',
    description:
      'Tlingit is the language of the Tlingit people of Southeast Alaska and Western Canada. Renowned for its complex phonology (including ejective consonants and tone) and rich ceremonial oratory, it is actively supported by tribal immersion schools.',
    family: 'Na-Dene > Tlingit',
    iso: 'tli',
    lat: 58.3,
    lon: -134.42,
    tags: ['na-dene', 'tonal', 'ejectives', 'ceremonial oratory', 'pacific northwest'],
    featuredPhrase: {
      text: 'Yá At Wuskóowu',
      translation: 'This ancient wisdom',
      phonetic: '/já ʔat wuskuːwu/',
    },
    moderationStatus: 'APPROVED',
    visibility: 'PUBLIC',
  },
]

export const RECENT_CONTRIBUTIONS: Contribution[] = [
  {
    id: '1',
    languageId: 'tzeltal',
    languageName: 'Tzeltal',
    type: 'audio',
    title: 'Traditional harvest ceremony invocation',
    contributor: 'María Pérez Gómez',
    contributorName: 'María Pérez Gómez',
    location: 'San Cristóbal, Mexico',
    date: '14 minutes ago',
    verified: true,
    moderationStatus: 'APPROVED',
    excerpt: "A 4-minute recording of the traditional maize harvest blessing, spoken by an elder of the Bats'il k'op community.",
  },
  {
    id: '2',
    languageId: 'ainu',
    languageName: 'Ainu',
    type: 'story',
    title: 'Kamuy yukar — divine epic of the owl deity',
    contributor: 'Hiroshi Yamamoto',
    contributorName: 'Hiroshi Yamamoto',
    location: 'Sapporo, Japan',
    date: '2 hours ago',
    verified: true,
    moderationStatus: 'APPROVED',
    excerpt: 'A transcription and recording of a traditional Ainu epic poem narrated by one of the last native speakers.',
  },
  {
    id: '3',
    languageId: 'tlingit',
    languageName: 'Tlingit',
    type: 'vocabulary',
    title: '240 maritime navigation terms',
    contributor: 'Sarah Jim',
    contributorName: 'Sarah Jim',
    location: 'Juneau, Alaska',
    date: '6 hours ago',
    verified: true,
    moderationStatus: 'APPROVED',
    excerpt: 'Complete vocabulary set for Tlingit maritime navigation, including terms for weather patterns, currents, and celestial navigation.',
  },
  {
    id: '4',
    languageId: 'livonian',
    languageName: 'Livonian',
    type: 'cultural-context',
    title: 'Fishing village naming conventions',
    contributor: 'Kristaps Bērziņš',
    contributorName: 'Kristaps Bērziņš',
    location: 'Mazirbē, Latvia',
    date: '1 day ago',
    verified: true,
    moderationStatus: 'APPROVED',
    excerpt: 'Documentation of the traditional Livonian system for naming fishing grounds, vessels, and weather phenomena.',
  },
  {
    id: '5',
    languageId: 'cornish',
    languageName: 'Cornish',
    type: 'audio',
    title: 'Mining songs of West Penwith',
    contributor: 'Thomas Trevithick',
    contributorName: 'Thomas Trevithick',
    location: 'Penzance, Cornwall',
    date: '5 hours ago',
    verified: true,
    moderationStatus: 'APPROVED',
    excerpt: 'A collection of 12 traditional songs sung by tin miners, preserved in Cornish with English annotations.',
  },
]

export const GLOBAL_METRICS = {
  languagesPreserved: 2847,
  audioContributions: 1284300,
  storiesArchived: 94720,
  activeContributors: 38400,
  countriesRepresented: 147,
  hoursRecorded: 186200,
}

export const SAMPLE_CONTRIBUTOR: Contributor = {
  id: 'user-1',
  name: 'Dr. Amara Osei-Bonsu',
  location: 'Accra, Ghana & Oxford, UK',
  languages: ['Twi', 'Dagaare', 'Akan', 'Hausa'],
  contributions: 847,
  reputationScore: 94,
  verifiedCount: 712,
  joinDate: 'March 2022',
  bio: 'Linguist and cultural anthropologist specializing in West African oral traditions. Member of the UNESCO Intangible Heritage advisory board.',
}

export const VITALITY_STATUS_LABELS: Record<string, string> = {
  safe: 'Safe',
  vulnerable: 'Vulnerable',
  endangered: 'Endangered',
  'critically-endangered': 'Critically Endangered',
  dormant: 'Dormant',
}

export const VITALITY_STATUS_COLORS: Record<string, string> = {
  safe: '#3E6B48',
  vulnerable: '#C8A96B',
  endangered: '#8C5A3C',
  'critically-endangered': '#9B3A2A',
  dormant: '#6B5A4E',
}

export function formatSpeakers(n: number): string {
  if (n < 100) return `${n} speakers`
  if (n < 1000) return `~${n} speakers`
  if (n < 1000000) return `${(n / 1000).toFixed(0)}K speakers`
  return `${(n / 1000000).toFixed(1)}M speakers`
}

export function formatNumber(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(0)}K`
  return n.toString()
}
