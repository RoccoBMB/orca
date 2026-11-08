import { realpath } from 'node:fs/promises'
import { normalizeRuntimePathForComparison } from '../../shared/cross-platform-path'

export async function isHomeDirectoryPath(
  candidate: string,
  home: string,
  canonical = true
): Promise<boolean> {
  if (!canonical) {
    return normalizeRuntimePathForComparison(candidate) === normalizeRuntimePathForComparison(home)
  }
  try {
    const [candidatePath, homePath] = await Promise.all([realpath(candidate), realpath(home)])
    return (
      normalizeRuntimePathForComparison(candidatePath) ===
      normalizeRuntimePathForComparison(homePath)
    )
  } catch {
    return normalizeRuntimePathForComparison(candidate) === normalizeRuntimePathForComparison(home)
  }
}
