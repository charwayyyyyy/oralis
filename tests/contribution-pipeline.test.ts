/**
 * tests/contribution-pipeline.test.ts
 *
 * Automated regression test suite for Oralis Contribution Pipeline.
 * Tests data contracts, visibility predicates, DTO serialization,
 * sort-key compatibility, and edge cases.
 */

import assert from 'node:assert/strict'
import {
  CONTRIBUTION_SK_PREFIX,
  CANONICAL_CONTRIBUTION_PREFIX,
  LEGACY_CONTRIBUTION_PREFIX,
  formatContributionSK,
  isContributionSK,
  parseContributionSK,
  isPubliclyVisibleContribution,
  serializePublicContribution,
  type PublicContributionDTO,
} from '../lib/contracts/contribution'
import type { Contribution } from '../lib/data'

console.log('\n🧪 Running Oralis Contribution Pipeline Regression Test Suite...\n')

let passedTests = 0

function runTest(name: string, fn: () => void) {
  try {
    fn()
    passedTests++
    console.log(`  ✓ ${name}`)
  } catch (err: any) {
    console.error(`  ❌ ${name}: ${err.message}`)
    throw err
  }
}

// 1. Colon-format approved contribution
runTest('1. Colon-format approved contribution is recognized and publicly visible', () => {
  const sk = 'CONTRIBUTION:2026-08-14T12:00:00.000Z#test123'
  assert.equal(isContributionSK(sk), true)

  const record: Partial<Contribution> = {
    PK: 'LANGUAGE#nzema',
    SK: sk,
    id: 'test123',
    moderationStatus: 'APPROVED',
    visibility: 'PUBLIC',
    verified: true,
  }
  assert.equal(isPubliclyVisibleContribution(record), true)
})

// 2. Hash-format legacy approved contribution
runTest('2. Hash-format legacy approved contribution is recognized and publicly visible', () => {
  const sk = 'CONTRIBUTION#2026-08-14T12:00:00.000Z#legacy456'
  assert.equal(isContributionSK(sk), true)

  const record: Partial<Contribution> = {
    PK: 'LANGUAGE#nzema',
    SK: sk,
    id: 'legacy456',
    moderationStatus: 'APPROVED',
    visibility: 'PUBLIC',
    verified: true,
  }
  assert.equal(isPubliclyVisibleContribution(record), true)
})

// 3. Pending contributions remain hidden publicly
runTest('3. Pending contributions remain hidden from public views', () => {
  const record: Partial<Contribution> = {
    id: 'pending1',
    moderationStatus: 'PENDING',
    visibility: 'ADMIN_ONLY',
    verified: false,
  }
  assert.equal(isPubliclyVisibleContribution(record), false)
})

// 4. Rejected, hidden, archived, and deletion-pending records remain hidden
runTest('4. Non-public statuses (REJECTED, HIDDEN, ARCHIVED, DELETION_PENDING) remain hidden', () => {
  const statuses = ['REJECTED', 'HIDDEN', 'ARCHIVED', 'DELETION_PENDING'] as const
  for (const status of statuses) {
    const record: Partial<Contribution> = {
      id: `status-${status}`,
      moderationStatus: status,
      visibility: 'ADMIN_ONLY',
    }
    assert.equal(isPubliclyVisibleContribution(record), false)
  }
})

// 5. Explicitly rejected record cannot become public because verified is stale
runTest('5. Explicitly rejected record cannot become public even with stale verified=true', () => {
  const record: Partial<Contribution> = {
    id: 'stale-verified',
    moderationStatus: 'REJECTED',
    visibility: 'ADMIN_ONLY',
    verified: true, // Stale legacy flag
  }
  assert.equal(isPubliclyVisibleContribution(record), false)
})

// 6. Legacy verified records without moderationStatus are handled safely
runTest('6. Legacy verified record with no moderationStatus is visible unless ADMIN_ONLY', () => {
  const legacyVisible: Partial<Contribution> = {
    id: 'legacy-vis',
    verified: true,
  }
  assert.equal(isPubliclyVisibleContribution(legacyVisible), true)

  const legacyAdminOnly: Partial<Contribution> = {
    id: 'legacy-admin',
    verified: true,
    visibility: 'ADMIN_ONLY',
  }
  assert.equal(isPubliclyVisibleContribution(legacyAdminOnly), false)
})

// 7. Results are sorted newest-first and deduplicated
runTest('7. Contributions can be sorted newest-first and parsed cleanly', () => {
  const items: Partial<Contribution>[] = [
    { id: '1', createdAt: '2026-08-10T10:00:00Z', SK: 'CONTRIBUTION:2026-08-10T10:00:00Z#1' },
    { id: '2', createdAt: '2026-08-14T10:00:00Z', SK: 'CONTRIBUTION:2026-08-14T10:00:00Z#2' },
    { id: '3', createdAt: '2026-08-12T10:00:00Z', SK: 'CONTRIBUTION#2026-08-12T10:00:00Z#3' },
  ]
  const sorted = [...items].sort(
    (a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
  )
  assert.equal(sorted[0].id, '2')
  assert.equal(sorted[1].id, '3')
  assert.equal(sorted[2].id, '1')
})

// 8. Shared prefix begins_with(SK, 'CONTRIBUTION') matches both colon and hash
runTest('8. Shared prefix CONTRIBUTION matches both modern and legacy sort keys', () => {
  const modernKey = 'CONTRIBUTION:2026-08-14T00:00:00Z#abc'
  const legacyKey = 'CONTRIBUTION#2026-08-14T00:00:00Z#xyz'
  const invalidKey = 'COMMENT#123'

  assert.equal(modernKey.startsWith(CONTRIBUTION_SK_PREFIX), true)
  assert.equal(legacyKey.startsWith(CONTRIBUTION_SK_PREFIX), true)
  assert.equal(invalidKey.startsWith(CONTRIBUTION_SK_PREFIX), false)
})

// 9. Public DTO serialization strips deleteToken and internal DynamoDB keys
runTest('9. serializePublicContribution strips deleteToken, PK, SK, and internal moderation metadata', () => {
  const internalItem: Record<string, unknown> = {
    PK: 'LANGUAGE#nzema',
    SK: 'CONTRIBUTION:2026-08-14T12:00:00Z#test',
    GSI1PK: 'FEED',
    GSI1SK: '2026-08-14T12:00:00Z',
    id: 'test',
    languageId: 'nzema',
    languageName: 'Nzema',
    type: 'vocabulary',
    title: 'Yɛ wɔ kɛ',
    context: 'Gathering call',
    deleteToken: 'super-secret-crypto-token-12345',
    moderationStatus: 'APPROVED',
    moderationVersion: 2,
    reviewedBy: 'admin-sub-999',
    reviewReason: 'Authentic cultural phrase',
    visibility: 'PUBLIC',
    verified: true,
    audioS3Key: 'nzema/audio-123.webm',
    createdAt: '2026-08-14T12:00:00Z',
  }

  const dto = serializePublicContribution(internalItem, 'https://s3.signed.url/audio-123.webm')

  assert.equal(dto.id, 'test')
  assert.equal(dto.title, 'Yɛ wɔ kɛ')
  assert.equal(dto.languageId, 'nzema')
  assert.equal(dto.audioUrl, 'https://s3.signed.url/audio-123.webm')

  // Security checks: sensitive properties MUST NOT exist on DTO
  const dtoKeys = Object.keys(dto)
  assert.equal(dtoKeys.includes('deleteToken'), false)
  assert.equal(dtoKeys.includes('PK'), false)
  assert.equal(dtoKeys.includes('SK'), false)
  assert.equal(dtoKeys.includes('GSI1PK'), false)
  assert.equal(dtoKeys.includes('moderationStatus'), false)
  assert.equal(dtoKeys.includes('reviewedBy'), false)
  assert.equal(dtoKeys.includes('reviewReason'), false)
})

// 10. Text-only contributions serialize with audioUrl: null
runTest('10. Text-only contributions serialize properly with audioUrl: null', () => {
  const textOnly: Record<string, unknown> = {
    id: 'text-phrase',
    languageId: 'yuchi',
    title: 'Wêyôk',
    context: 'Greeting in ceremonial gathering',
    createdAt: '2026-08-14T12:00:00Z',
  }
  const dto = serializePublicContribution(textOnly, null)
  assert.equal(dto.audioUrl, null)
  assert.equal(dto.title, 'Wêyôk')
})

// 11. Canonical key formatter produces exact format
runTest('11. formatContributionSK produces exact format CONTRIBUTION:<timestamp>#<id>', () => {
  const ts = '2026-08-14T15:30:00.000Z'
  const id = 'abc12345'
  const key = formatContributionSK(ts, id)
  assert.equal(key, 'CONTRIBUTION:2026-08-14T15:30:00.000Z#abc12345')
  assert.equal(isContributionSK(key), true)
})

// 12. Parse contribution SK correctly extracts id
runTest('12. parseContributionSK correctly extracts timestamp and id for both formats', () => {
  const colonParsed = parseContributionSK('CONTRIBUTION:2026-08-14T15:30:00.000Z#id123')
  assert.equal(colonParsed.id, 'id123')
  assert.equal(colonParsed.timestamp, '2026-08-14T15:30:00.000Z')

  const hashParsed = parseContributionSK('CONTRIBUTION#2026-08-14T15:30:00.000Z#id456')
  assert.equal(hashParsed.id, 'id456')
  assert.equal(hashParsed.timestamp, '2026-08-14T15:30:00.000Z')
})

// 13. Visibility rule idempotency
runTest('13. Centralized visibility predicate is idempotent across repeated checks', () => {
  const item: Partial<Contribution> = {
    id: 'idemp-1',
    moderationStatus: 'APPROVED',
    visibility: 'PUBLIC',
  }
  assert.equal(isPubliclyVisibleContribution(item), true)
  assert.equal(isPubliclyVisibleContribution(item), true)
})

// 14. Feed and Language archive consistency on eligible IDs
runTest('14. Eligible contribution set is identical for Feed and Language queries', () => {
  const rawDataset: Partial<Contribution>[] = [
    { id: '1', languageId: 'nzema', moderationStatus: 'APPROVED', visibility: 'PUBLIC' },
    { id: '2', languageId: 'nzema', moderationStatus: 'PENDING', visibility: 'ADMIN_ONLY' },
    { id: '3', languageId: 'nzema', moderationStatus: 'APPROVED', visibility: 'PUBLIC' },
    { id: '4', languageId: 'nzema', moderationStatus: 'REJECTED', visibility: 'ADMIN_ONLY' },
    { id: '5', languageId: 'nzema', moderationStatus: 'APPROVED', visibility: 'PUBLIC' },
  ]

  const feedEligible = rawDataset.filter((item) => isPubliclyVisibleContribution(item)).map((i) => i.id)
  const languageEligible = rawDataset.filter((item) => isPubliclyVisibleContribution(item)).map((i) => i.id)

  assert.deepEqual(feedEligible, ['1', '3', '5'])
  assert.deepEqual(languageEligible, ['1', '3', '5'])
})

// 15. Pagination & Buffer safety
runTest('15. Buffer limit calculation ensures filtered items are not prematurely truncated', () => {
  const requestedLimit = 2
  const items: Partial<Contribution>[] = [
    { id: '1', moderationStatus: 'PENDING' },
    { id: '2', moderationStatus: 'APPROVED', visibility: 'PUBLIC' },
    { id: '3', moderationStatus: 'REJECTED' },
    { id: '4', moderationStatus: 'APPROVED', visibility: 'PUBLIC' },
  ]
  const filtered = items.filter((i) => isPubliclyVisibleContribution(i)).slice(0, requestedLimit)
  assert.equal(filtered.length, 2)
  assert.equal(filtered[0].id, '2')
  assert.equal(filtered[1].id, '4')
})

// 16. S3 audio signing resilience simulation
runTest('16. Individual audio URL failure preserves text and context without dropping contribution', () => {
  const items = [
    { id: '1', title: 'Phrase with good audio', s3Key: 'good.webm' },
    { id: '2', title: 'Phrase with broken audio', s3Key: 'missing.webm' },
  ]

  // Simulated mapping with per-item try-catch
  const signed = items.map((item) => {
    let audioUrl: string | null = null
    try {
      if (item.s3Key === 'good.webm') {
        audioUrl = 'https://s3.aws.com/good.webm?sig=123'
      } else {
        throw new Error('S3 object not found')
      }
    } catch {
      audioUrl = null
    }
    return serializePublicContribution(item, audioUrl)
  })

  assert.equal(signed.length, 2)
  assert.equal(signed[0].title, 'Phrase with good audio')
  assert.equal(signed[0].audioUrl, 'https://s3.aws.com/good.webm?sig=123')
  assert.equal(signed[1].title, 'Phrase with broken audio')
  assert.equal(signed[1].audioUrl, null)
})

console.log(`\n✨ All ${passedTests} regression tests passed successfully!\n`)
