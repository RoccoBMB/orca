import { describe, expect, it, vi } from 'vitest'

vi.mock('./branding', async () => ({ branding: (await import('./branding.json')).default }))

import { brandCliCopy } from './branding-copy'
import { createOrcaI18n } from './orca-i18n-instance'
import { brandedDocumentation } from './branded-documentation'
import { translate as translateMobile } from '../../mobile/src/i18n/mobile-i18n'

describe('Maestro presentation boundary', () => {
  it('brands mobile plural fallbacks before inserting a user name', () => {
    expect(
      translateMobile('brand-test.missing', 'Orca tools for {{name}}', {
        count: 1,
        name: 'Orca',
        defaultValue_one: 'Orca tool for {{name}}',
        defaultValue_other: 'Orca tools for {{name}}'
      })
    ).toBe('Maestro tool for Orca')
  })
  it('interpolates catalog and fallback copy before inserting user data', async () => {
    const { i18n, translate } = createOrcaI18n({
      englishResources: { mobile: 'Orca Mobile', heading: 'ORCA' },
      loadCatalog: (language) =>
        language === 'ja' ? Promise.resolve({ mobile: 'Orcaのモバイル' }) : undefined
    })
    expect(translate('mobile', 'Orca Mobile')).toBe('Maestro Mobile')
    expect(translate('heading', 'ORCA')).toBe('MAESTRO')
    expect(translate('error', 'Orca could not open {{path}}', { path: '/tmp/Orca/project' })).toBe(
      'Maestro could not open /tmp/Orca/project'
    )
    expect(translate('project', 'Open {{name}} in Orca', { name: 'Orca' })).toBe(
      'Open Orca in Maestro'
    )
    await i18n.changeLanguage('ja')
    expect(translate('mobile', 'Orca Mobile')).toBe('Maestroのモバイル')
  })

  it('brands executable examples while preserving compatibility identifiers and links', () => {
    expect(brandCliCopy('Run `orca plugin --help` on the Orca host.')).toBe(
      'Run `maestro plugin --help` on the Maestro host.'
    )
    expect(
      brandCliCopy(
        'orca-plugin.json engines.orca window.orca ORCA_CLI_COMMAND ~/.orca https://github.com/stablyai/orca'
      )
    ).toBe(
      'orca-plugin.json engines.orca window.orca ORCA_CLI_COMMAND ~/.orca https://github.com/stablyai/orca'
    )
  })

  it('keeps plugin module and global names in documentation', () => {
    expect(brandedDocumentation('```js\norca instanceof Object\n```')).toBe(
      '```js\norca instanceof Object\n```'
    )
    expect(brandedDocumentation('`orca instanceof Object`')).toBe('`orca instanceof Object`')
    expect(brandedDocumentation('[Orca](https://docs.invalid/?product=Orca)')).toBe(
      '[Maestro](https://docs.invalid/?product=Orca)'
    )
    expect(
      brandedDocumentation(
        'Orca plugins import `orca` and `orca/worker`. Run `orca plugin test .`.'
      )
    ).toBe('Maestro plugins import `orca` and `orca/worker`. Run `maestro plugin test .`.')
    expect(
      brandedDocumentation('```js\nconst api = orca\n```\n```sh\norca-dev plugin validate .\n```')
    ).toBe('```js\nconst api = orca\n```\n```sh\nmaestro-dev plugin validate .\n```')
    expect(brandCliCopy('Use `orca-ide serve` or `orca-dev plugin --help`.')).toBe(
      'Use `maestro serve` or `maestro-dev plugin --help`.'
    )
  })
})
