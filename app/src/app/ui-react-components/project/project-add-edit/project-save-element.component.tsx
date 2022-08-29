import { Manager } from 'app/libs/Manager/Manager.class'
import { AnitaStore } from 'app/libs/redux/reducers.const'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import React from 'react'
import { Button } from 'app/ui-react-components/shared-components/common-ui-eles/button.component'

interface IProjectSaveElementProps {
  sectionId: string
}

export const ProjectSaveElement: React.FC<IProjectSaveElementProps> = ({ sectionId }) => {
  const element = useSelector((state: AnitaStore) => state.formElement.element)
  const validObj = useSelector((state: AnitaStore) => state.formElesValidState)
  const navigate = useNavigate()

  const handleClick = async () => {
    await Manager.getCurrentProject().getSectionById(sectionId).saveElement(element)
    navigate(-1)
  }

  return (
    <div className="mt-6 flex justify-end">
      <Button
        id="cancel"
        label="Cancel"
        type="secondary"
        onClick={() => navigate(-1)}
      />
      <Button
        id="save"
        label="Save"
        type="primary"
        disabled={Object.keys(validObj).some(key => validObj[key] === false)}
        onClick={handleClick}
      />
    </div>
  )
}
