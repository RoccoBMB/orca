import { describe, expect, it } from 'vitest'
import {
  emptyOrcadActivationRecord,
  parseOrcadActivationRecord,
  serializeOrcadActivationRecord,
  withActivatedVersion
} from './orcad-activation-record'

describe('remote activation application ownership', () => {
  it.each(['com.stablyai.orca', undefined])(
    'refuses foreign or unmarked activation (%s)',
    (appId) => {
      const record = JSON.stringify({
        schemaVersion: 1,
        appId,
        active: '0.2.0+abcd',
        previous: null,
        activatedAt: null,
        snapshot: null
      })
      expect(parseOrcadActivationRecord(record)).toEqual({
        state: 'unreadable',
        reason: 'activation record belongs to another application'
      })
    }
  )

  it('round-trips an owned activation and refuses to rewrite an explicit foreign owner', () => {
    const record = withActivatedVersion(
      emptyOrcadActivationRecord(),
      '0.2.0+abcd',
      null,
      new Date(0)
    )
    expect(parseOrcadActivationRecord(serializeOrcadActivationRecord(record))).toMatchObject({
      state: 'ok',
      record: { appId: 'dev.rocco.maestro', active: '0.2.0+abcd' }
    })
    expect(() => serializeOrcadActivationRecord({ ...record, appId: 'com.stablyai.orca' })).toThrow(
      /another application/
    )
  })
})
