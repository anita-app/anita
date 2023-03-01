import { useAssistant } from 'app/components/admin-layout/assistant/assistant-provider'
import { AssistantToolbarEnterApiKey } from 'app/components/admin-layout/assistant/assistant-toolbar-enter-api-key'
import { AssistantToolbarEnterPrompt } from 'app/components/admin-layout/assistant/assistant-toolbar-enter-prompt'
import { AssistantToolbarOpenButton } from 'app/components/admin-layout/assistant/assistant-toolbar-open-button'
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

  const { responses } = useAssistant()

  if (!isOpen) {
    return (
      <AssistantToolbarOpenButton openAssistant={openAssistant} />
    )
  }

  return (
    <div className={`fixed flex flex-col right-0 bottom-0 p-4 h-full max-h-full z-[10] overflow-y-auto ${apiKey ? 'w-full' : 'w-auto'}`}>
      <div className="flex flex-col max-h-full bg-white mt-2 rounded-lg shadow-md border">
        <div className="flex justify-end">
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
        <div className="p-4">
          {!!apiKey && <AssistantToolbarEnterPrompt apiKey={apiKey} />}
          {!apiKey && <AssistantToolbarEnterApiKey handleApiKeySubmit={handleApiKeySubmit} />}
        </div>
        {responses.length > 0 && (
          <div className="flex flex-col max-h-full p-4 overflow-auto">
            <h3 className="text-lg font-semibold">Responses</h3>
            <ul className="mt-2">
              {responses.map((response, index) => (
                <li key={index} className="mt-2">
                  <div className="bg-gray-100 p-2 rounded-lg">
                    <pre className="text-sm">{response}</pre>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
