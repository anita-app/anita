import {
  optionsBuilderForAddingAdvanced,
  optionsBuilderForAddingBasic,
  optionsBuilderForEditingAdvanced,
  optionsBuilderForEditingBasic
  } from 'app/data/project-form-builder/options-builder.constant';
import { projectFormFieldsModel } from 'app/data/project-form-builder/project-info-builder.constant';
import {
  sectionElesForEditingAdvanced,
  sectionElesForEditingBasic,
  sectionElesNewItemAdvanced,
  sectionElesNewItemBasic
  } from 'app/data/project-form-builder/section-fields-builder.constant';
import { sectionDetailsFormFieldsModel } from 'app/data/project-form-builder/section-info-builder.constant';

export enum PROJECT_EDITOR_MODE {
  advanced = 1,
  basic
};

export const PROJECT_EDITOR_FORM_BUILDER = {
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
