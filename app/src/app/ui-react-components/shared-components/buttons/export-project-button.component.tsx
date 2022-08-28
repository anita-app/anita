import { Manager } from 'app/libs/Manager/Manager.class'
import ReactTooltip from 'react-tooltip'
import React from 'react'

export const ExportButton: React.FC = () => (
  <button
    className="px-4 py-3 text-gray-800 mr-3 inline-flex items-center ml-auto leading-none text-sm bg-gray-100 hover:bg-gray-200 rounded"
    data-tip={true} data-for="exportProject"
    onClick={Manager.getCurrentProject().export}
  >
    <i className="bi bi-arrow-bar-up"></i>
    <ReactTooltip id="exportProject" effect="solid">
      Export project
    </ReactTooltip>
  </button>
)
