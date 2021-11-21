import { RESERVED_UDS_KEYS } from 'app/data/model/project-info';
import { ElementSaver } from 'app/libs/project-helpers/section-elements-handlers/element-saver.class';
import { AnitaStore } from 'app/libs/redux/reducers.const';
import { EDITOR_MODE } from 'app/ui-react-components/editor-mode.enum';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

export const SaveElement = ({ sectionId }: { sectionId: string }) => {

  const project = useSelector((state: AnitaStore) => state.project);
  const element = useSelector((state: AnitaStore) => state.formElement.element);
  const validObj = useSelector((state: AnitaStore) => state.formElesValidState);
  const navigate = useNavigate();

  const handleClick = async () => {
    const mode = element.id ? EDITOR_MODE.edit : EDITOR_MODE.add;
    await new ElementSaver(project[RESERVED_UDS_KEYS._settings][0].id, sectionId, element, mode).save();
    navigate(-1);
  }

  return (
    <div className="mt-6 mb-3 px-2 flex justify-end">
      <button
        className="py-2 px-6 bg-gray-200 font-semibold rounded hover:bg-gray-300 mr-3"
        onClick={() => navigate(-1)}
      >Cancel</button>
      <button
        disabled={Object.keys(validObj).some(key => validObj[key] === false)}
        className="py-2 px-6 bg-prussian-blue-400 text-white font-semibold rounded hover:bg-prussian-blue-500"
        onClick={handleClick}
      >Save</button>
    </div>
  )

}
