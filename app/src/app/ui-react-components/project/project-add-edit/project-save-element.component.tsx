import { Manager } from 'app/libs/Manager/Manager.class'
import { AnitaStore } from 'app/libs/redux/reducers.const'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import React from 'react'

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
    <div className="mt-6 mb-3 px-2 flex justify-end">
      <button
        className="py-2 px-6 bg-gray-200 font-semibold rounded hover:bg-gray-300 mr-3"
        onClick={() => navigate(-1)}
      >Cancel
      </button>
      <button
        disabled={Object.keys(validObj).some(key => validObj[key] === false)}
        className="py-2 px-6 bg-prussian-blue-400 text-white font-semibold rounded hover:bg-prussian-blue-500"
        onClick={handleClick}
      >Save
      </button>
    </div>
  )
}
