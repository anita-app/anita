/* eslint-disable @typescript-eslint/no-unused-vars */
import { useAssistant } from 'app/components/admin-layout/assistant/assistant-provider'
import { useMultiState } from 'app/components/hooks/multi-state.hook'
import { useShortcut } from 'app/components/hooks/shortcut'
import { FORM_ELEMENTS_CSS_CLASSES } from 'app/components/shared-components/forms-automator/form-layout/fom-elements-css-classes.const'
import { fetchFromOpenAI, IAssistantHistory } from 'app/libs/assistant/open-ai-helper'
import * as React from 'react'
import { PLATFORM } from 'app/const/platform.const'
import { Button } from 'app/components/shared-components/common-ui-eles/button.component'
import { Type } from 'app/components/shared-components/common-ui-eles/components.const'
import { Icons } from 'app/libs/icons/icons.class'

interface IAssistantToolbarEnterPromptProps {
  apiKey: string
}

interface IAssistantToolbarEnterPromptState {
  query: string
  isFetching: boolean
}

const HISTORY: IAssistantHistory = {
  queries: [],
  responses: []
}

export const AssistantToolbarEnterPrompt: React.FC<IAssistantToolbarEnterPromptProps> = (props) => {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)
  const [state, setState, getState] = useMultiState<IAssistantToolbarEnterPromptState>({ query: '', isFetching: false })
  const { responses, setQueries, setResponses, clear } = useAssistant()
  const handleAssistantRequest = async (event: React.MouseEvent | KeyboardEvent) => {
    event.preventDefault()
    const query = getState().query
    setState({ isFetching: true })
    HISTORY.queries.push(query)
    setQueries(HISTORY.queries)
    setState({ query: '' })
    const response = await fetchFromOpenAI(props.apiKey, HISTORY)
    setState({ isFetching: false })
    HISTORY.responses.push(response)
    setResponses(HISTORY.responses)
  }

  const focusTextarea = (e?: KeyboardEvent) => {
    if (textareaRef.current && document.activeElement !== textareaRef.current) {
      e?.preventDefault()
      e?.stopPropagation()
      textareaRef.current.focus()
    }
  }

  React.useEffect(() => {
    if (responses.length > 0) {
      focusTextarea()
    }
  }, [responses])

  useShortcut({
    id: 'submit-assistant-request',
    key: 'Enter',
    withMetaKey: true,
    callback: handleAssistantRequest
  })

  useShortcut({
    id: 'focus-textarea',
    key: 'k',
    withMetaKey: true,
    callback: focusTextarea
  })

  const doClear = () => {
    setState({ query: '' })
    clear()
    HISTORY.queries.length = 0
    HISTORY.responses.length = 0
  }

  const metaSymbol = PLATFORM.IS_APPLE ? '⌘' : 'Ctrl'

  return (
    <>
      {state.isFetching && (
        <div className="chat-message">
          <div className="flex items-end">
            <div className="flex flex-col space-y-2 text-xs order-2 items-start mb-4">
              <div>
                <span className="px-4 py-2 rounded-lg inline-block rounded-bl-none bg-gray-300 text-gray-600 whitespace-pre-line animate-pulse">
                  {Icons.render('ellipsisHorizontalOutline')}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
      <textarea
        ref={textareaRef}
        className={`${FORM_ELEMENTS_CSS_CLASSES} w-full`}
        autoFocus={true}
        autoComplete="off"
        autoCapitalize="off"
        value={state.query}
        disabled={state.isFetching}
        onChange={(e) => setState({ query: e.target.value })}
        placeholder="Enter your request here"
      />
      <div className="flex justify-end md:justify-between text-xs text-gray-500">
        <span className="hidden md:block">Press {metaSymbol}+Enter to submit</span>
        <span>
          {!!responses.length && (
            <Button
              id="ask-assistant"
              type={Type.secondary}
              onClick={doClear}
              label="Clear"
              disabled={state.isFetching}
              size="md"
            />
          )}
          <Button
            id="ask-assistant"
            type={Type.primary}
            onClick={handleAssistantRequest}
            label="Submit"
            disabled={state.isFetching}
            size="md"
            marginClassName="mr-0"
          />
        </span>
      </div>
    </>
  )
}
