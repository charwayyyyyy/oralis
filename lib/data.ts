export type VitalityStatus = 'safe' | 'vulnerable' | 'endangered' | 'critically-endangered' | 'dormant'

export interface Language {
  id: string
  name: string
  nativeName: string
  region: string
  country: string
  continent: string
  speakers: number
  status: VitalityStatus
  vitalityScore: number // 0-100
  audioCount: number
  storiesArchived: number
  contributors: number
  lastContribution: string
  description: string
  family: string
  iso: string
  lat: number
  lon: number
  tags: string[]
  featuredPhrase?: { text: string; translation: string; phonetic: string }
}

export interface Contribution {
  id: string
  languageId: string
  languageName: string
  type: 'vocabulary' | 'audio' | 'story' | 'cultural-context'
  title: string
  contributor: string
  location: string
  date: string
  verified: boolean
  excerpt?: string
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
      phonetic: '/iŋkar an jaŋ/',
    },
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
      text: "Bats'il k'op",
      translation: 'True language / true word',
      phonetic: "/batsʼil kʼop/",
    },
  },
  {
    id: 'yuchi',
    name: 'Yuchi',
    nativeName: 'Tsoyaha',
    region: 'Oklahoma',
    country: 'United States',
    continent: 'Americas',
    speakers: 5,
    status: 'critically-endangered',
    vitalityScore: 4,
    audioCount: 189,
    storiesArchived: 42,
    contributors: 8,
    lastContribution: '3 days ago',
    description:
      'Yuchi is a language isolate spoken by the Yuchi people of Oklahoma. With only a handful of fluent speakers, it represents a unique linguistic and cultural heritage with no known relatives among the world\'s languages.',
    family: 'Language isolate',
    iso: 'yuc',
    lat: 35.46,
    lon: -96.01,
    tags: ['isolate', 'ceremonial', 'tone language'],
    featuredPhrase: {
      text: 'Tsoyaha',
      translation: 'Children of the Sun',
      phonetic: '/tsojaˀha/',
    },
  },
  {
    id: 'cornish',
    name: 'Cornish',
    nativeName: 'Kernewek',
    region: 'Cornwall',
    country: 'United Kingdom',
    continent: 'Europe',
    speakers: 3500,
    status: 'endangered',
    vitalityScore: 34,
    audioCount: 892,
    storiesArchived: 218,
    contributors: 97,
    lastContribution: '5 hours ago',
    description:
      'Cornish is a Brittonic Celtic language that became dormant in the late 18th century but was revived in the 20th century through dedicated community efforts. It stands as a powerful symbol of language revitalization.',
    family: 'Celtic (Brittonic)',
    iso: 'cor',
    lat: 50.26,
    lon: -5.05,
    tags: ['celtic', 'revitalized', 'brittonic'],
    featuredPhrase: {
      text: 'Otta vy omma',
      translation: 'Here I am',
      phonetic: '/ˈɔtə viː ˈɔmə/',
    },
  },
  {
    id: 'livonian',
    name: 'Livonian',
    nativeName: 'Līvõ kēļ',
    region: 'Livonia Coast',
    country: 'Latvia',
    continent: 'Europe',
    speakers: 20,
    status: 'critically-endangered',
    vitalityScore: 12,
    audioCount: 234,
    storiesArchived: 61,
    contributors: 14,
    lastContribution: '1 day ago',
    description:
      'Livonian is a Finnic language historically spoken along the Livonian Coast of Latvia. It is one of the most endangered languages in Europe, with only a small number of semi-speakers remaining.',
    family: 'Finno-Ugric',
    iso: 'liv',
    lat: 57.54,
    lon: 22.06,
    tags: ['finnic', 'baltic region', 'coastal'],
    featuredPhrase: {
      text: 'Ma armasta sindõ',
      translation: 'I love you',
      phonetic: '/ma armaˈsta sinˈdõ/',
    },
  },
  {
    id: 'khmer-krom',
    name: 'Khmer Krom',
    nativeName: 'ភាសាខ្មែរក្រោម',
    region: 'Mekong Delta',
    country: 'Vietnam',
    continent: 'Asia',
    speakers: 1200000,
    status: 'vulnerable',
    vitalityScore: 58,
    audioCount: 2103,
    storiesArchived: 543,
    contributors: 287,
    lastContribution: '32 minutes ago',
    description:
      'Khmer Krom is spoken by the Khmer people of southern Vietnam\'s Mekong Delta region. While numerically significant, it faces institutional pressures and lacks official recognition, threatening intergenerational transmission.',
    family: 'Austroasiatic (Mon-Khmer)',
    iso: 'kxm',
    lat: 10.03,
    lon: 105.78,
    tags: ['austroasiatic', 'mon-khmer', 'diaspora'],
    featuredPhrase: {
      text: 'ខ្ញុំស្រឡាញ់អ្នក',
      translation: 'I love you',
      phonetic: '/kɲom srəlaɲ neak/',
    },
  },
  {
    id: 'tlingit',
    name: 'Tlingit',
    nativeName: 'Lingít',
    region: 'Southeast Alaska',
    country: 'United States / Canada',
    continent: 'Americas',
    speakers: 900,
    status: 'endangered',
    vitalityScore: 28,
    audioCount: 678,
    storiesArchived: 192,
    contributors: 64,
    lastContribution: '6 hours ago',
    description:
      'Tlingit is spoken along the Pacific coast of southeastern Alaska and adjacent Canada. Known for its extraordinarily complex grammar and rich oral tradition including clan histories, ceremonial oratory, and song.',
    family: 'Na-Dene',
    iso: 'tli',
    lat: 57.05,
    lon: -135.33,
    tags: ['na-dene', 'tonal', 'northwest coast', 'ceremonial'],
    featuredPhrase: {
      text: 'Gunalchéesh',
      translation: 'Thank you',
      phonetic: '/ɡuˈnalˌtʃeːʃ/',
    },
  },
  {
    id: 'mapudungun',
    name: 'Mapudungun',
    nativeName: 'Mapudungun',
    region: 'Araucanía',
    country: 'Chile / Argentina',
    continent: 'Americas',
    speakers: 150000,
    status: 'endangered',
    vitalityScore: 42,
    audioCount: 1543,
    storiesArchived: 387,
    contributors: 203,
    lastContribution: '1 hour ago',
    description:
      'Mapudungun is the language of the Mapuche people of southern Chile and Argentina. It is an agglutinative language with a rich tradition of oral poetry called ülkantun and ceremonial songs.',
    family: 'Araucanian (isolate-like)',
    iso: 'arn',
    lat: -38.73,
    lon: -72.59,
    tags: ['isolate', 'agglutinative', 'oral poetry', 'indigenous rights'],
    featuredPhrase: {
      text: 'Küme mongen',
      translation: 'Good life / wellbeing',
      phonetic: '/ˈküme ˈmoŋen/',
    },
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
    location: 'San Cristóbal, Mexico',
    date: '14 minutes ago',
    verified: true,
    excerpt: 'A 4-minute recording of the traditional maize harvest blessing, spoken by an elder of the Bats\'il k\'op community.',
  },
  {
    id: '2',
    languageId: 'ainu',
    languageName: 'Ainu',
    type: 'story',
    title: 'Kamuy yukar — divine epic of the owl deity',
    contributor: 'Hiroshi Yamamoto',
    location: 'Sapporo, Japan',
    date: '2 hours ago',
    verified: true,
    excerpt: 'A transcription and recording of a traditional Ainu epic poem narrated by one of the last native speakers.',
  },
  {
    id: '3',
    languageId: 'tlingit',
    languageName: 'Tlingit',
    type: 'vocabulary',
    title: '240 maritime navigation terms',
    contributor: 'Sarah Jim',
    location: 'Juneau, Alaska',
    date: '6 hours ago',
    verified: false,
    excerpt: 'Complete vocabulary set for Tlingit maritime navigation, including terms for weather patterns, currents, and celestial navigation.',
  },
  {
    id: '4',
    languageId: 'livonian',
    languageName: 'Livonian',
    type: 'cultural-context',
    title: 'Fishing village naming conventions',
    contributor: 'Kristaps Bērziņš',
    location: 'Mazirbē, Latvia',
    date: '1 day ago',
    verified: true,
    excerpt: 'Documentation of the traditional Livonian system for naming fishing grounds, vessels, and weather phenomena.',
  },
  {
    id: '5',
    languageId: 'cornish',
    languageName: 'Cornish',
    type: 'audio',
    title: 'Mining songs of West Penwith',
    contributor: 'Thomas Trevithick',
    location: 'Penzance, Cornwall',
    date: '5 hours ago',
    verified: true,
    excerpt: 'A collection of 12 traditional songs sung by tin miners, preserved in Cornish with English annotations.',
  },
  {
    id: '6',
    languageId: 'mapudungun',
    languageName: 'Mapudungun',
    type: 'story',
    title: 'Ülkantun — song of the araucaria forest',
    contributor: 'Rosa Cañumil',
    location: 'Temuco, Chile',
    date: '1 hour ago',
    verified: false,
    excerpt: 'Traditional ülkantun poetry describing the relationship between the Mapuche people and the pehuén tree.',
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

export const VITALITY_STATUS_LABELS: Record<VitalityStatus, string> = {
  safe: 'Safe',
  vulnerable: 'Vulnerable',
  endangered: 'Endangered',
  'critically-endangered': 'Critically Endangered',
  dormant: 'Dormant',
}

export const VITALITY_STATUS_COLORS: Record<VitalityStatus, string> = {
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
