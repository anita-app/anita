import { useAssistant } from 'app/components/admin-layout/assistant/assistant-provider'
import { Button } from 'app/components/shared-components/common-ui-eles/button.component'
import { Type } from 'app/components/shared-components/common-ui-eles/components.const'
import * as React from 'react'

interface IAssistantToolbarEnterPromptProps {
  apiKey: string
}

export const AssistantToolbarEnterPrompt: React.FC<IAssistantToolbarEnterPromptProps> = (props) => {
  const [query, setQuery] = React.useState('')
  const { addQuery, addResponse } = useAssistant()
  const handleAssistantRequest = (event: React.FormEvent) => {
    event.preventDefault()
    addQuery(query)
    console.log('Request sent', props.apiKey)
    addResponse('Response received')
  }
  return (
    <form onSubmit={handleAssistantRequest}>
      <input
        className="border rounded-lg py-2 px-3 mb-4 w-full"
        type="text"
        autoFocus={true}
        autoComplete="off"
        autoCapitalize="off"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Enter your request here"
      />
      <Button
        id="submit"
        type={Type.secondary}
        label="submit"
        onClick={handleAssistantRequest}
      />
    </form>
  )
}
