import { branding } from './branding'
import { brandProductCopy } from './branding-copy'

// Inline module names and API examples remain upstream-compatible; only shell invocations change.
export function brandedDocumentation(markdown: string): string {
  if (branding.productName === 'Orca') {
    return markdown
  }
  const selected = markdown.replace(
    /## Resolve the CLI for this session\n[\s\S]*?(?=## Load the version-matched guide)/,
    `## Resolve the CLI for this session\n\nUse \`ORCA_CLI_COMMAND\` when set. Otherwise use \`${branding.cliCommand}-dev\` in a development checkout (\`ORCA_DEV_REPO_ROOT\`), \`${branding.linuxCliCommand}\` on Linux, or \`${branding.cliCommand}\` on other platforms. Use that same executable for every command in this session.\n\n`
  )
  return selected
    .split(/(```[\s\S]*?```|`[^`\n]+`|https?:\/\/[^\s)<>]+)/g)
    .map((part) => {
      if (/^https?:\/\//.test(part)) {
        return part
      }
      if (!part.startsWith('`')) {
        return brandProductCopy(part)
      }
      if (
        part.startsWith('```') &&
        !/^```(?:bash|sh|shell|text|console|powershell|pwsh|cmd|zsh|fish)\s*\n/.test(part)
      ) {
        return part
      }
      return part.replace(
        /(?<=^`|\n)(\s*(?:\$ )?)(?:ORCA|orca(?:-dev|-ide)?)(?=\s+(?!(?:instanceof|in|as|satisfies|of|extends)\b)(?:[a-z][a-z-]*|--help|--version)(?:\s|$|`))/g,
        (match) =>
          match.replace(/ORCA|orca(?:-dev|-ide)?/, (command) =>
            command === 'orca-dev'
              ? `${branding.cliCommand}-dev`
              : command === 'orca-ide'
                ? branding.linuxCliCommand
                : branding.cliCommand
          )
      )
    })
    .join('')
}
