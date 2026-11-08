import { branding } from './branding'
import { isCatalogObject } from './i18n-catalog-object'

// Adapt upstream copy at presentation boundaries; identifiers, URLs and paths stay intact.
export function productCopyTemplate(text: string): string {
  if (branding.productName === 'Orca') {
    return text
  }
  return text
    .replaceAll('오르카', '{{productName}}')
    .replace(
      /(^|[^A-Za-z0-9_./@:\\])Orca(?! (?:Computer Use|Terminal Host)\.app\b)(?![A-Za-z0-9_/@\\]|\.[A-Za-z])/g,
      '$1{{productName}}'
    )
    .replace(
      /(^|[^A-Za-z0-9_./@:\\])ORCA(?![A-Za-z0-9_/@\\]|\.[A-Za-z])/g,
      '$1{{productNameUpper}}'
    )
    .replace(
      /(^|[^A-Za-z0-9_./@:\\-])(orca(?:-dev|-ide)?)(?=\s|$|`)/g,
      (_match, prefix, command) =>
        prefix +
        (command === 'orca-dev'
          ? '{{cliCommand}}-dev'
          : command === 'orca-ide'
            ? '{{linuxCliCommand}}'
            : '{{cliCommand}}')
    )
}

export const productCopyVariables = {
  productName: branding.productName,
  productNameUpper: branding.productName.toUpperCase(),
  cliCommand: branding.cliCommand,
  linuxCliCommand: branding.linuxCliCommand
}

export function brandProductCopy(text: string): string {
  return productCopyTemplate(text)
    .replaceAll('{{productName}}', branding.productName)
    .replaceAll('{{productNameUpper}}', branding.productName.toUpperCase())
    .replaceAll('{{cliCommand}}', branding.cliCommand)
    .replaceAll('{{linuxCliCommand}}', branding.linuxCliCommand)
}

export function brandCliCopy(text: string): string {
  return brandProductCopy(text)
}

export function productMessage(parts: TemplateStringsArray, ...values: unknown[]): string {
  return parts
    .map(
      (part, index) => brandProductCopy(part) + (index < values.length ? String(values[index]) : '')
    )
    .join('')
}

export function productCopyCatalog(catalog: Record<string, unknown>): Record<string, unknown> {
  if (branding.productName === 'Orca') {
    return catalog
  }
  return Object.fromEntries(
    Object.entries(catalog).map(([key, value]) => [
      key,
      typeof value === 'string'
        ? productCopyTemplate(value)
        : isCatalogObject(value)
          ? productCopyCatalog(value)
          : value
    ])
  )
}
