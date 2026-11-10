import { useAppStore } from '@/store'
import { conductorAppearanceEnabled } from '../../../../shared/maestro-settings'
import { formatNativeChatDuration } from './NativeChatWorkingStatus'
import { useMemo } from 'react'
import {
  nativeChatLiveLine,
  type NativeChatLiveLine
} from '../../../../shared/native-chat/transcript/native-chat-live-line'
import { isNativeChatRowInLiveWorkingTurn } from '../../../../shared/native-chat/transcript/native-chat-live-turn-membership'
import {
  buildNativeChatTranscriptSlots,
  type NativeChatTranscriptSlot
} from './native-chat-transcript-slots'
import type { NativeChatTranscriptSlotsInput } from './native-chat-transcript-input'

/** Choose slots/activity together so reasoning shown by the activity line never also gets a transcript row. */
export function useNativeChatTranscriptSlots({
  line,
  ...input
}: Omit<NativeChatTranscriptSlotsInput, 'liveReasoningId'> & {
  line: { draws: boolean; thinking: boolean; stopping?: boolean; activityText?: string | null }
}): { slots: NativeChatTranscriptSlot[]; liveLine: NativeChatLiveLine | null } {
  const conductor = useAppStore((s) => conductorAppearanceEnabled(s.settings))
  const {
    messages,
    unresolvedRowIds,
    typography,
    turnKeys,
    liveTurnKey,
    receipts,
    turnStatuses,
    turnDiffs,
    openedPullRequests,
    expandedTurnKeys,
    isWorking,
    lifecycleWorking,
    subagentSections,
    subagentChoices
  } = input
  const { draws, thinking, stopping = false, activityText } = line
  const liveLine = useMemo(
    () =>
      nativeChatLiveLine({
        draws,
        thinking,
        stopping,
        activityText,
        messages,
        inLiveWorkingTurn: (index) =>
          isNativeChatRowInLiveWorkingTurn(
            turnKeys[index],
            liveTurnKey,
            isWorking || lifecycleWorking,
            unresolvedRowIds?.has(messages[index]!.id)
          )
      }),
    [
      activityText,
      draws,
      isWorking,
      lifecycleWorking,
      liveTurnKey,
      messages,
      stopping,
      thinking,
      turnKeys,
      unresolvedRowIds
    ]
  )
  const liveReasoningId = liveLine?.reasoning?.message.id ?? null
  const slots = useMemo(
    () =>
      buildNativeChatTranscriptSlots({
        messages,
        unresolvedRowIds,
        typography,
        turnKeys,
        liveTurnKey,
        receipts,
        turnStatuses,
        turnDiffs,
        openedPullRequests,
        expandedTurnKeys,
        isWorking,
        lifecycleWorking,
        subagentSections,
        subagentChoices,
        liveReasoningId
      }),
    [
      expandedTurnKeys,
      isWorking,
      lifecycleWorking,
      liveReasoningId,
      liveTurnKey,
      messages,
      openedPullRequests,
      receipts,
      subagentChoices,
      subagentSections,
      turnDiffs,
      turnKeys,
      turnStatuses,
      typography,
      unresolvedRowIds
    ]
  )
  const presentedSlots = useMemo(() => {
    if (!conductor) {
      return slots
    }
    const responseIds = new Set(
      slots.flatMap((slot) =>
        slot.kind === 'message' && slot.endsResponse ? [slot.message.id] : []
      )
    )
    const summaries = new Map<string, { tools: number; messages: number }>()
    messages.forEach((message, index) => {
      const key = turnKeys[index]
      if (!key) {
        return
      }
      const summary = summaries.get(key) ?? { tools: 0, messages: 0 }
      summary.tools += message.blocks.filter((block) => block.type === 'tool-call').length
      if (
        message.role === 'assistant' &&
        !responseIds.has(message.id) &&
        message.blocks.some((block) => block.type === 'text' && block.text.trim())
      ) {
        summary.messages++
      }
      summaries.set(key, summary)
    })
    return slots.map((slot) => {
      if (slot.kind !== 'message' || !slot.turnKey) {
        return slot
      }
      const seconds = turnStatuses.completedByTurn[slot.turnKey]?.workedSeconds
      return {
        ...slot,
        maestroSummary: slot.status ? summaries.get(slot.turnKey) : undefined,
        maestroDuration:
          slot.endsResponse && seconds != null ? formatNativeChatDuration(seconds) : undefined
      }
    })
  }, [conductor, slots, messages, turnKeys, turnStatuses])
  return { slots: presentedSlots, liveLine }
}
