/**
 * Supported reducer actions
 */
export enum REDUX_ACTIONS {
  // LAYOUT
  toggleSidebar = 1,
  // PROJECTS
  addProjectToList,
  setProjectList,
  // PROJECT
  setCurrentProject,
  // SECTIONS_FOR_CHILD_OF_SELECTOR
  addSectionForChildOfSelector,
  resetSectionForChildOfSelector,
  // FORMS
  setValidStateForEle,
  unsetValidStateForEle,
  updateFormElement,
  setFormProject,
  updateFormProjectSettings,
  updateFormProjectAddSection,
  updateFormProjectUpdateSection,
  updateFormProjectUpdateFormModelOfSection,
  updateFormProjectRemoveSection,
  updateFormProjectAddFieldToSection,
  updateFormProjectRemoveFieldFromSection,
  updateFormProjectUpdateFormModelAddOption,
  updateFormProjectUpdateFormModelDeleteOption,
  updateFormProjectUpdateFormModelOptionValue
};
