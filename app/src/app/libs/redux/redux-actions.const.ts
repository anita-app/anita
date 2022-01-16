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
  resetCurrentProject,
  // SECTIONS_FOR_CHILD_OF_SELECTOR
  addSectionForChildOfSelector,
  resetSectionForChildOfSelector,
  // FORMS
  setValidStateForEle,
  unsetValidStateForEle,
  updateFormElement,
  updateFormElementKey,
  setFormProject,
  setProjectEditorMode,
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
