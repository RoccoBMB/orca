import type {
  BundledSkillInstallResult,
  BundledSkillPlan
} from '../../../shared/bundled-skill-plan'
import { brandedBundledSkillSources } from './branded-bundled-skill-sources'
import {
  autoUpdateBundledSkills,
  executeBundledSkillPlan,
  type BundledSkillExecuteInput
} from './execute'
import { nativeBundledSkillFilesystem } from './filesystem'
import { buildBundledSkillPlan } from './plan'

export type BundledSkillServiceInput = Omit<BundledSkillExecuteInput, 'filesystem' | 'sources'> &
  Partial<Pick<BundledSkillExecuteInput, 'filesystem' | 'sources'>>

function withDefaults(input: BundledSkillServiceInput): BundledSkillExecuteInput {
  return {
    ...input,
    filesystem: input.filesystem ?? nativeBundledSkillFilesystem,
    sources: input.sources ?? brandedBundledSkillSources
  }
}

export async function previewBundledSkillInstall(
  input: BundledSkillServiceInput
): Promise<BundledSkillPlan> {
  return (await buildBundledSkillPlan(withDefaults(input))).plan
}

/** Execute by preview digest, never by client-supplied operations. */
export async function installBundledSkills(
  input: BundledSkillServiceInput,
  planDigest: string
): Promise<BundledSkillInstallResult> {
  return executeBundledSkillPlan(withDefaults(input), planDigest)
}

/** Silent path: updates only hash-verified Orca copies of `names`, planned under the same locks. */
export async function autoUpdateInstalledBundledSkills(
  input: BundledSkillServiceInput & { names: readonly string[] }
): Promise<BundledSkillInstallResult> {
  return autoUpdateBundledSkills({ ...withDefaults(input), names: input.names })
}
