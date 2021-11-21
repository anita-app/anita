import { ANITA_URLS, URL_PARAMS } from 'app/anita-routes/anita-routes.constant';
import { urlParamFiller } from 'app/anita-routes/url-param-fillers.function';
import { EDITOR_MODE } from 'app/ui-react-components/editor-mode.enum';
import { Link } from 'react-router-dom';

interface IAddElementButtonProps {
  projectId: string;
  sectionId: string;
  mode: EDITOR_MODE.add;
  elementId?: never;
}

interface IEditElementButtonProps {
  projectId: string;
  sectionId: string;
  elementId: string;
  mode: EDITOR_MODE.edit;
}

type IAddEditElementButtonProps = | IAddElementButtonProps | IEditElementButtonProps;

export const AddEditElementButton = ({ projectId, sectionId, mode, elementId }: IAddEditElementButtonProps) => {

  const icon = mode === EDITOR_MODE.add ? 'bi-plus' : 'bi-pencil';
  const urlParamsToFill = [{ name: URL_PARAMS.projectId, value: projectId }, { name: URL_PARAMS.sectionId, value: sectionId }];

  if (mode === EDITOR_MODE.edit)
    urlParamsToFill.push({ name: URL_PARAMS.elementId, value: elementId })

  const urlToFill = mode === EDITOR_MODE.add ? ANITA_URLS.projectSectionAddEle : ANITA_URLS.projectSectionEditEle;

  const url: string = urlParamFiller(urlToFill, urlParamsToFill);

  return (
    <Link to={url} className="absolute bottom-5 right-7 md:bottom-7 md:right-10 bg-prussian-blue-400 text-white text-xl shadow-xl rounded-3xl h-14 w-14 flex items-center justify-center">
      <i className={icon}></i>
    </Link>
  )

}