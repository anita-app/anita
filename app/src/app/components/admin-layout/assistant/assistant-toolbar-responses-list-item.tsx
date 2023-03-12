import { Button } from 'app/components/shared-components/common-ui-eles/button.component'
import { Type } from 'app/components/shared-components/common-ui-eles/components.const'
import * as React from 'react'

interface IAssistantToolbarResponsesListItemProps {
  response: string
  index: number
  queries: Array<string>
}

export const AssistantToolbarResponsesListItem: React.FC<IAssistantToolbarResponsesListItemProps> = (props) => (
  <li key={props.index} className="mt-2 border border-gray-200 shadow-md rounded-md p-4">
    <div className="flex justify-between bg-gray-100 p-2 rounded-t-lg">
      <div className="flex items-center">
        <div className="whitespace-pre-line text-sm italic">
          {props.queries[props.index]}
        </div>
      </div>
    </div>
    <div className="bg-gray-50 p-2 rounded-b-lg text-sm whitespace-pre-line relative">
      <Button
        id="copy-to-clipboard"
        type={Type.transparent}
        size="xs"
        className="absolute right-1 top-1"
        label="Copy to clipboard"
        onClick={() => {
          navigator.clipboard.writeText(props.response)
        }}
        marginClassName="mr-0"
      />
      {props.response}
    </div>
  </li>
)
