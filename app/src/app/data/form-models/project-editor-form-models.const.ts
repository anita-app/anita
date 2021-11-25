import {
  optionsBuilderForAddingAdvanced,
  optionsBuilderForAddingBasic,
  optionsBuilderForEditingAdvanced,
  optionsBuilderForEditingBasic
  } from 'app/data/form-models/options-builder.constant';
import { projectFormFieldsModel } from 'app/data/form-models/project-form-fields-model.constant';
import {
  sectionDetailsFormFieldsModel,
  sectionElesForEditingAdvanced,
  sectionElesForEditingBasic,
  sectionElesNewItemAdvanced,
  sectionElesNewItemBasic
  } from 'app/data/form-models/section-builder.constant';

export enum PROJECT_EDITOR_MODE {
  advanced = 1,
  basic
};

export const PROJECT_EDITOR_FORM_MODELS_CONST = {
  [PROJECT_EDITOR_MODE.advanced]: {
    projectInfo: projectFormFieldsModel,
    sectionInfo: sectionDetailsFormFieldsModel,
    sectionEles: {
      newItem: sectionElesNewItemAdvanced,
      existingItem: sectionElesForEditingAdvanced
    },
    optionEles: {
      newItem: optionsBuilderForAddingAdvanced,
      existingItem: optionsBuilderForEditingAdvanced
    }
  },
  [PROJECT_EDITOR_MODE.basic]: {
    projectInfo: projectFormFieldsModel,
    sectionInfo: sectionDetailsFormFieldsModel,
    sectionEles: {
      newItem: sectionElesNewItemBasic,
      existingItem: sectionElesForEditingBasic
    },
    optionEles: {
      newItem: optionsBuilderForAddingBasic,
      existingItem: optionsBuilderForEditingBasic
    }
  }
};
