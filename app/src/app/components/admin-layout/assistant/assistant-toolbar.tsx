import { useAssistant } from 'app/components/admin-layout/assistant/assistant-provider'
import { AssistantToolbarEnterApiKey } from 'app/components/admin-layout/assistant/assistant-toolbar-enter-api-key'
import { AssistantToolbarEnterPrompt } from 'app/components/admin-layout/assistant/assistant-toolbar-enter-prompt'
import { AssistantToolbarOpenButton } from 'app/components/admin-layout/assistant/assistant-toolbar-open-button'
import { AssistantToolbarResponsesList } from 'app/components/admin-layout/assistant/assistant-toolbar-responses-list'
import { useShortcut } from 'app/components/hooks/shortcut'
import { Button } from 'app/components/shared-components/common-ui-eles/button.component'
import { Type } from 'app/components/shared-components/common-ui-eles/components.const'
import React, { useState, useEffect } from 'react'

export const AssistantToolbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [apiKey, setApiKey] = useState('')

  useEffect(() => {
    // Check if apiKey is already stored in localStorage
    const storedApiKey = localStorage.getItem('apiKey')
    if (storedApiKey) {
      setApiKey(storedApiKey)
    }
  }, [])

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const toggleToolbar = () => {
    setIsOpen(!isOpen)
  }

  const openAssistant = (e: KeyboardEvent | React.MouseEvent) => {
    e.preventDefault()
    setIsOpen(true)
  }

  const closeAssistant = () => {
    setIsOpen(false)
  }

  const handleApiKeySubmit = (e: React.FormEvent, apiKey: string) => {
    e.preventDefault()
    localStorage.setItem('apiKey', apiKey)
    setApiKey(apiKey)
  }

  useShortcut({
    id: 'close-assistant',
    key: 'Escape',
    callback: closeAssistant
  })

  useShortcut({
    id: 'open-assistant',
    key: 'k',
    withMetaKey: true,
    callback: openAssistant
  })

  const { responses, queries } = useAssistant()

  if (!isOpen) {
    return (
      <AssistantToolbarOpenButton openAssistant={openAssistant} />
    )
  }

  return (
    <div className={`fixed flex flex-col right-0 bottom-0 p-4 h-full max-h-full z-[10] overflow-y-auto ${apiKey ? 'w-full' : 'w-auto'}`}>
      <div className="mt-auto flex flex-col max-h-full bg-white rounded-lg shadow-md border">
        <div className="flex justify-end mb-0.5">
          <Button
            id="close"
            type={Type.transparent}
            iconLeft="close"
            onClick={closeAssistant}
            label="Close"
            labelClassName="hidden"
            breakpoint="xxl"
            marginClassName="mt-1 mr-2"
            size="xs"
          />
        </div>
        <div className="p-4 pt-0">
          {!!apiKey && <AssistantToolbarEnterPrompt apiKey={apiKey} />}
          {!apiKey && <AssistantToolbarEnterApiKey handleApiKeySubmit={handleApiKeySubmit} />}
        </div>
        <AssistantToolbarResponsesList responses={responses} queries={queries} />
      </div>
    </div>
  )
}
