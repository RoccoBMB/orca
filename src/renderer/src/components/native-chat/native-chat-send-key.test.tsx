// @vitest-environment happy-dom
import { cleanup, fireEvent, render } from '@testing-library/react'
import { useState } from 'react'
import { afterEach, expect, it, vi } from 'vitest'
import { useNativeChatComposerKeyDown } from './use-native-chat-composer-keydown'

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

function Composer() {
  const [sent, setSent] = useState('unsent')
  const onKeyDown = useNativeChatComposerKeyDown({
    modifiedSend: true,
    autocomplete: { mode: 'none' },
    mentionFiles: { files: [], loading: false, failed: false },
    completeMention: () => {},
    activeSuggestion: 0,
    draft: 'Check the redirect',
    isComposing: () => false,
    completePickerItem: () => {},
    dispatchPickerCommand: () => {},
    dismissPicker: () => {},
    interrupt: () => {},
    send: (intent) => setSent(intent?.alternate ? 'alternate' : 'primary'),
    setActiveSuggestion: () => {},
    setDraft: () => {},
    setCaret: () => {}
  })
  return (
    <>
      <textarea aria-label="Message" onKeyDown={onKeyDown} />
      <output>{sent}</output>
    </>
  )
}

it.each([
  ['Macintosh', { metaKey: true }],
  ['Windows', { ctrlKey: true }],
  ['Linux', { ctrlKey: true }]
])('keeps newlines and sends the chosen or alternate action on %s', (userAgent, modifier) => {
  vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue(userAgent)
  const view = render(<Composer />)
  const field = view.getByRole('textbox', { name: 'Message' })
  const output = view.getByRole('status')
  expect(fireEvent.keyDown(field, { key: 'Enter' })).toBe(true)
  expect(fireEvent.keyDown(field, { key: 'Enter', shiftKey: true })).toBe(true)
  expect(output.textContent).toBe('unsent')
  fireEvent.keyDown(field, { key: 'Enter', ...modifier, isComposing: true })
  expect(output.textContent).toBe('unsent')
  fireEvent.keyDown(field, { key: 'Enter', ...modifier })
  expect(output.textContent).toBe('primary')
  fireEvent.keyDown(field, { key: 'Enter', ...modifier, altKey: true })
  expect(output.textContent).toBe('alternate')
})
