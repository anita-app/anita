import { Button } from 'app/components/shared-components/common-ui-eles/button.component'
import { Type } from 'app/components/shared-components/common-ui-eles/components.const'
import * as React from 'react'

interface IAssistantToolbarOpenButtonProps {
  openAssistant: (e: React.MouseEvent) => void
}

export const AssistantToolbarOpenButton: React.FC<IAssistantToolbarOpenButtonProps> = (props) => (
  <div className="fixed right-0 bottom-0 p-4">
    <Button
      id="assistant"
      type={Type.primary}
      className="bg-gray-700 hover:bg-gray-800 text-white py-2 px-4 rounded"
      onClick={props.openAssistant}
      iconLeft="bulb"
      label="Assistant"
      tooltip="ctrl+K"
      breakpoint="md"
    />
  </div>
)
