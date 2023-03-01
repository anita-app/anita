import { Button } from 'app/components/shared-components/common-ui-eles/button.component'
import { Type } from 'app/components/shared-components/common-ui-eles/components.const'
import * as React from 'react'

interface IAssistantToolbarEnterApiKeyProps {
  handleApiKeySubmit: (e: React.FormEvent, apiKey: string) => void
}

export const AssistantToolbarEnterApiKey: React.FC<IAssistantToolbarEnterApiKeyProps> = (props) => {
  const [apiKey, setApiKey] = React.useState('')

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setApiKey(e.target.value)
  }
  return (
    <form onSubmit={(e) => props.handleApiKeySubmit(e, apiKey)}>
      <input
        className="border border-prussian-blue-500 rounded-lg py-2 px-3 mb-4 w-full"
        type="text"
        placeholder="Please enter your OpenAI API key:"
        value={apiKey}
        autoFocus={true}
        autoComplete="off"
        autoCapitalize="off"
        onChange={handleApiKeyChange}
      />
      <Button
        id="save"
        type={Type.primary}
        label="Save"
        onClick={(e) => props.handleApiKeySubmit(e, apiKey)}
      />
    </form>
  )
}
