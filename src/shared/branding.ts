import defaults from './branding-default.json'

declare const ORCA_BRANDING: typeof defaults | undefined

// Build-time identity cannot be changed by a packaged app's environment.
// oxlint-disable-next-line unicorn/no-typeof-undefined -- absent in unbundled source; a bare read throws.
export const branding = typeof ORCA_BRANDING === 'undefined' ? defaults : ORCA_BRANDING
