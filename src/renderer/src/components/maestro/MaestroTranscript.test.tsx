// @vitest-environment happy-dom
import { cleanup, fireEvent, screen } from '@testing-library/react'
import { afterAll, afterEach, beforeAll, expect, it } from 'vitest'
import { useAppStore } from '@/store'
import { createGlobalSettingsFixture } from '../../../../shared/global-settings-test-fixture'
import { render } from '../native-chat/native-chat-tooltip-test-harness'
import { NativeChatMessageList } from '../native-chat/NativeChatMessageList'
import { installNativeChatMessageListTestViewport } from '../native-chat/native-chat-message-list-test-viewport'

let restoreViewport = () => {}
const originalSettings = useAppStore.getState().settings
beforeAll(() => {
  restoreViewport = installNativeChatMessageListTestViewport()
})
afterAll(() => restoreViewport())
afterEach(() => {
  cleanup()
  useAppStore.setState({ settings: originalSettings })
})

it('keeps the final answer visible and expands the original tool work behind a Maestro turn disclosure', () => {
  useAppStore.setState({
    settings: createGlobalSettingsFixture({ maestro: { conductorAppearance: true } })
  })
  render(
    <NativeChatMessageList
      session={{
        agent: 'claude',
        sessionId: 'maestro-test',
        status: 'ready',
        hasMore: false,
        loadingEarlier: false,
        olderHistoryGeneration: 0,
        loadEarlier: async () => 'exhausted',
        trimHistory: () => {},
        readPhase: 'ready',
        messages: [
          {
            id: 'user',
            role: 'user',
            source: 'transcript',
            timestamp: 1000,
            blocks: [{ type: 'text', text: 'Inspect this repository' }]
          },
          {
            id: 'preamble',
            role: 'assistant',
            source: 'transcript',
            timestamp: 2000,
            blocks: [{ type: 'text', text: 'Inspecting repository' }]
          },
          {
            id: 'work',
            role: 'assistant',
            source: 'transcript',
            timestamp: 3000,
            blocks: [
              { type: 'tool-call', name: 'shell', input: { command: 'ls' }, state: 'completed' }
            ]
          },
          {
            id: 'answer',
            role: 'assistant',
            source: 'transcript',
            timestamp: 5000,
            blocks: [{ type: 'text', text: 'Repository is ready' }]
          }
        ]
      }}
      settledTurns={new Map([['user', { startedAt: 1000, workedSeconds: 4 }]])}
      isWorking={false}
      expandSignal={false}
    />
  )
  expect(screen.queryByText('Inspecting repository')).toBeNull()
  expect(screen.getByText('Repository is ready')).toBeTruthy()
  const disclosure = screen.getByRole('button', { name: 'Toggle turn details' })
  expect(disclosure.getAttribute('aria-expanded')).toBe('false')
  fireEvent.click(disclosure)
  expect(screen.getByText('Inspecting repository')).toBeTruthy()
  expect(disclosure.getAttribute('aria-expanded')).toBe('true')
})
