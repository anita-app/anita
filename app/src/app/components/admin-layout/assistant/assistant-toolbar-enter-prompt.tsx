import { useAssistant } from 'app/components/admin-layout/assistant/assistant-provider'
import { useMultiState } from 'app/components/hooks/multi-state.hook'
import { useShortcut } from 'app/components/hooks/shortcut'
import { FORM_ELEMENTS_CSS_CLASSES } from 'app/components/shared-components/forms-automator/form-layout/fom-elements-css-classes.const'
import { fetchFromOpenAI } from 'app/libs/assistant/open-ai-helper'
import * as React from 'react'
import { PLATFORM } from 'app/const/platform.const'

interface IAssistantToolbarEnterPromptProps {
  apiKey: string
}

interface IAssistantToolbarEnterPromptState {
  query: string
  isFetching: boolean
}

export const AssistantToolbarEnterPrompt: React.FC<IAssistantToolbarEnterPromptProps> = (props) => {
  const [state, setState, getState] = useMultiState<IAssistantToolbarEnterPromptState>({ query: '', isFetching: false })
  const { addQuery, addResponse } = useAssistant()
  const handleAssistantRequest = async (event: React.MouseEvent | KeyboardEvent) => {
    event.preventDefault()
    const query = getState().query
    setState({ isFetching: true })
    const response = await fetchFromOpenAI(query, props.apiKey)
    setState({ isFetching: false, query: '' })
    addQuery(query)
    addResponse(response)
  }

  useShortcut({
    id: 'submit-assistant-request',
    key: 'Enter',
    withMetaKey: true,
    callback: handleAssistantRequest
  })

  const metaSymbol = PLATFORM.IS_APPLE ? '⌘' : 'Ctrl'

  return (
    <>
      <textarea
        className={`${FORM_ELEMENTS_CSS_CLASSES} w-full`}
        autoFocus={true}
        autoComplete="off"
        autoCapitalize="off"
        value={state.query}
        disabled={state.isFetching}
        onChange={(e) => setState({ query: e.target.value })}
        placeholder="Enter your request here"
      />
      <div className="flex justify-start text-xs text-gray-500">
        Press {metaSymbol}+Enter to submit
      </div>
    </>
  )
}
