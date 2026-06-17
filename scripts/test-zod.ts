import { ContributionCreateSchema } from './lib/validations'

const raw = {
  languageId: 'akan',
  languageName: 'Akan',
  contentType: 'vocabulary',
  title: 'sumsum',
  body: '',
  context: 'when speaking of a soul',
  source: '',
  location: '',
  contributorName: 'Theo'
}

const parsed = ContributionCreateSchema.safeParse(raw)
if (!parsed.success) {
  const err = parsed.error as any
  console.log("Validation Failed!")
  console.log(err.issues || err.errors)
} else {
  console.log("Validation Succeeded!")
}
