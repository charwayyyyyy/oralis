/**
 * components/contribution-wizard/types.ts
 * Shared types for the wizard state machine.
 */

export type UsageType = 'formal' | 'informal' | 'ceremonial' | 'everyday' | 'proverb'

export interface PhraseEntry {
  id:          string
  prompt:      string       // the cultural prompt shown to the user
  text:        string       // phrase in the language
  translation: string       // English translation
  audioBlob:   Blob | null  // recorded/uploaded audio (local state only)
  audioUrl:    string | null // S3 URL after upload
  s3Key:       string | null
  context:     string
  usage:       UsageType | ''
  uploading:   boolean
  uploaded:    boolean
}

export interface WizardState {
  // Step 1
  languageName:   string
  nativeName:     string
  region:         string
  languageId:     string  // slugified, set after API call
  languageCreated: boolean

  // Step 2–4: phrase collection
  phrases: PhraseEntry[]
  activePromptIndex: number

  // Step 5: submission
  submitting: boolean
  submitted:  boolean
  submitError: string | null
}

export const WIZARD_STEPS = [
  { number: 1, label: 'Declare',   description: 'Name the language' },
  { number: 2, label: 'Phrases',   description: 'Collect meaningful expressions' },
  { number: 3, label: 'Record',    description: 'Capture the sound' },
  { number: 4, label: 'Enrich',    description: 'Add cultural context' },
  { number: 5, label: 'Preserve',  description: 'Review and submit' },
] as const

export type WizardStep = 1 | 2 | 3 | 4 | 5

export const CULTURAL_PROMPTS: { prompt: string; category: string }[] = [
  { prompt: 'How do you greet someone in the morning?',              category: 'greeting'    },
  { prompt: 'What do elders say to give advice to the young?',       category: 'wisdom'      },
  { prompt: 'How do you express deep gratitude?',                    category: 'gratitude'   },
  { prompt: 'Say a proverb that your community lives by.',           category: 'proverb'     },
  { prompt: 'How do you say "I am here" or "I have arrived"?',       category: 'presence'    },
  { prompt: 'What phrase is said before sharing a meal?',            category: 'ritual'      },
  { prompt: 'How do you comfort someone who is grieving?',           category: 'empathy'     },
  { prompt: 'What is the name for the most sacred time of day?',     category: 'sacred'      },
  { prompt: 'How do you say goodbye when parting for a long time?',  category: 'farewell'    },
  { prompt: 'What phrase celebrates a new birth?',                   category: 'celebration' },
  { prompt: 'How do you ask for permission respectfully?',           category: 'respect'     },
  { prompt: 'What is a phrase sung to children at night?',           category: 'lullaby'     },
  { prompt: 'How do you acknowledge someone\'s hard work?',          category: 'recognition' },
  { prompt: 'What word describes the feeling of belonging to a place?', category: 'belonging' },
  { prompt: 'How do you call someone to gather as a community?',     category: 'community'   },
  { prompt: 'What phrase marks the start of an important ceremony?', category: 'ceremony'    },
  { prompt: 'How do you express that something is beautiful?',       category: 'beauty'      },
  { prompt: 'What is the word for the spirit of an ancestor?',       category: 'ancestors'   },
  { prompt: 'How do you say "the land is sacred"?',                  category: 'land'        },
  { prompt: 'What phrase warns of danger in your tradition?',        category: 'warning'     },
]

export function getRandomPrompts(count: number): { prompt: string; category: string }[] {
  const shuffled = [...CULTURAL_PROMPTS].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, Math.min(count, CULTURAL_PROMPTS.length))
}

export function createEmptyPhrase(prompt: string): PhraseEntry {
  return {
    id:          Math.random().toString(36).slice(2, 10),
    prompt,
    text:        '',
    translation: '',
    audioBlob:   null,
    audioUrl:    null,
    s3Key:       null,
    context:     '',
    usage:       '',
    uploading:   false,
    uploaded:    false,
  }
}
