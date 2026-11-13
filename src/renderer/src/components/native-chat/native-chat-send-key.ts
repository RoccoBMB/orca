import { useAppStore } from '@/store'
import { maestroUsesModifiedSend } from '../../../../shared/maestro-settings'
import {
  useNativeChatComposerKeyDown,
  type UseNativeChatComposerKeyDownArgs
} from './use-native-chat-composer-keydown'

export function useMaestroComposerKeyDown(args: UseNativeChatComposerKeyDownArgs) {
  return useNativeChatComposerKeyDown({ ...args, modifiedSend: useNativeChatModifiedSend() })
}

export function useNativeChatModifiedSend(): boolean {
  return useAppStore((state) => maestroUsesModifiedSend(state.settings))
}
