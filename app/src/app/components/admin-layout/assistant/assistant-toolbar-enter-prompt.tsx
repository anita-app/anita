import { Button } from 'app/components/shared-components/common-ui-eles/button.component'
import { Type } from 'app/components/shared-components/common-ui-eles/components.const'
import * as React from 'react'

interface IAssistantToolbarEnterPromptProps {
  apiKey: string
}

export const AssistantToolbarEnterPrompt: React.FC<IAssistantToolbarEnterPromptProps> = (props) => {
  const handleAssistantRequest = (event: React.FormEvent) => {
    event.preventDefault()
    console.log('Request sent', props.apiKey)
  }
  return (
    <form onSubmit={handleAssistantRequest}>
      <input
        className="border rounded-lg py-2 px-3 mb-4 w-full"
        type="text"
        autoFocus={true}
        autoComplete="off"
        autoCapitalize="off"
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
