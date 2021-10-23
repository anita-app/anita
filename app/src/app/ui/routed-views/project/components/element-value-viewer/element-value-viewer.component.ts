import { Component, Input } from '@angular/core';
import { FORM_COMPONENTS_CODES } from '@anita/client/data/model/form-model-commons';
import { SectionCustomFieldProperties, SectionElement, SectionSystemFieldsProperties } from '@anita/client/data/model/project-info';
import { ElementSaver } from '@anita/client/libs/projects-helpers/section-elements-handlers/element-saver.class';
import { currentRouteConstant, URL_PARAMS } from '@anita/client/ng-services/app-routing/current-route.constant';
import { EDITOR_MODE } from '@anita/client/ui/editor-mode.enum';

@Component({
  selector: 'app-element-value-viewer',
  templateUrl: './element-value-viewer.component.html'
})
export class ElementValueViewerComponent {

  @Input()
  public fieldElement: SectionSystemFieldsProperties | SectionCustomFieldProperties;
  @Input()
  public element: SectionElement;
  @Input()
  public fieldName: string;
  @Input()
  public showLabel = true;

  public basicInput = FORM_COMPONENTS_CODES.basicInput;
  public basicTextarea = FORM_COMPONENTS_CODES.basicTextarea;
  public basicCheckbox = FORM_COMPONENTS_CODES.basicCheckbox;
  public basicSelect = FORM_COMPONENTS_CODES.basicSelect;
  public basicRadio = FORM_COMPONENTS_CODES.basicRadio;
  public datePicker = FORM_COMPONENTS_CODES.datePicker;
  public dateTimePicker = FORM_COMPONENTS_CODES.dateTimePicker;

  public toggle(element: SectionElement): void {
    new ElementSaver(
      currentRouteConstant.params[URL_PARAMS.projectId],
      currentRouteConstant.params[URL_PARAMS.sectionId],
      element,
      EDITOR_MODE.edit).save();
  }

}
