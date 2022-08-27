import { ProjectExporter } from 'app/libs/project-helpers/project-handlers/project-exporter';
import ReactTooltip from 'react-tooltip';

export const ExportButton: React.FC = () => (
  <button
    className="px-4 py-3 text-gray-800 mr-3 inline-flex items-center ml-auto leading-none text-sm bg-gray-100 hover:bg-gray-200 rounded"
    data-tip data-for="exportProject"
    onClick={ProjectExporter.export}
  >
    <i className="bi bi-arrow-bar-up"></i>
    <ReactTooltip id="exportProject" effect="solid">
      Export project
    </ReactTooltip>
  </button>
)