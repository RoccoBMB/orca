import { createHash } from 'node:crypto'
import { branding } from '../../../shared/branding'
import { brandedDocumentation } from '../../../shared/branded-documentation'
import { BUNDLED_SKILL_SOURCES } from './bundled-skill-sources'

export const brandedBundledSkillSources =
  branding.productName === 'Orca'
    ? BUNDLED_SKILL_SOURCES
    : BUNDLED_SKILL_SOURCES.map((source) => {
        const text = brandedDocumentation(source.text)
        return {
          ...source,
          text,
          releasedDigests: [
            ...source.releasedDigests,
            createHash('sha256').update(text).digest('hex')
          ]
        }
      })
