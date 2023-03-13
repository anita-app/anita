import { Button } from 'app/components/shared-components/common-ui-eles/button.component'
import { Type } from 'app/components/shared-components/common-ui-eles/components.const'
import * as React from 'react'

interface IAssistantToolbarResponsesListItemProps {
  response: string
  query: string
}

export const AssistantToolbarResponsesListItem: React.FC<IAssistantToolbarResponsesListItemProps> = (props) => (
  <li className="">
    <div className="chat-message">
      <div className="flex items-end justify-end my-2">
        <div className="flex flex-col space-y-2 text-xs order-1 items-end">
          <div>
            <span className="px-4 py-2 rounded-lg inline-block rounded-br-none bg-blue-600 text-white whitespace-pre-line">{props.query}</span>
          </div>
        </div>
      </div>
    </div>
    {!!props.response && (
      <div className="chat-message">
        <div className="flex items-end">
          <div className="flex flex-col space-y-2 text-xs order-2 items-start">
            <div className="flex items-top justify-start">
              <span className="px-4 py-2 rounded-lg inline-block rounded-bl-none bg-gray-300 text-gray-600 whitespace-pre-line">{props.response}</span>
              <Button
                id="copy-to-clipboard"
                type={Type.transparent}
                size="xs"
                className="h-8 w-8"
                label="Copy to clipboard"
                labelClassName="hidden"
                tooltip="Copy to clipboard"
                iconLeft="copyOutline"
                onClick={() => {
                  navigator.clipboard.writeText(props.response)
                }}
                marginClassName="mr-0 ml-1"
              />
            </div>
          </div>
        </div>
      </div>
    )}
  </li>
)
