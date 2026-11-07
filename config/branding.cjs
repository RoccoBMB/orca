const branding = require(
  process.env.ORCA_BRAND === 'maestro'
    ? '../src/shared/branding.json'
    : '../src/shared/branding-default.json'
)

module.exports = { branding, brandingDefines: { ORCA_BRANDING: JSON.stringify(branding) } }
