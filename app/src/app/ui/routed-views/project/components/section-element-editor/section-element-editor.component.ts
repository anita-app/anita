import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import {
  RESERVED_UDS_KEYS,
  Section,
  SectionCustomFieldProperties,
  SectionElement,
  SystemData
  } from '@anita/client/data/model/project-info';
import { ReducerTypes } from '@anita/client/libs/ng-rx/reducers.const';
import { ElementSaver } from '@anita/client/libs/projects-helpers/section-elements-handlers/element-saver.class';
import { currentRouteConstant, previousRoutes, URL_PARAMS } from '@anita/client/ng-services/app-routing/current-route.constant';
import { EDITOR_MODE } from '@anita/client/ui/editor-mode.enum';
import { ComponentCodeToName } from '@anita/client/ui/routed-views/project/components/section-element-editor/component-code-to-name.class';
import { FormInfoForBuilder } from '@anita/client/ui/shared-components/forms-automator/form-builder/form-builder';
import { FormDataParserService } from '@anita/client/ui/shared-components/forms-automator/form-builder/services/form-data-parser.service';
import { FormFieldsModel } from '@anita/client/ui/shared-components/forms-automator/form-fields/form-fields-model';
import { Store } from '@ngrx/store';
import { takeWhile } from 'rxjs/operators';

@Component({
  selector: 'app-section-element-editor',
  templateUrl: './section-element-editor.component.html'
})
export class SectionElementEditorComponent implements OnInit, OnDestroy {

  public project: SystemData;
  public section: Section;
  public watchProject = true;
  public sectionEles: FormInfoForBuilder<Array<Array<FormFieldsModel<Partial<SectionElement | SectionCustomFieldProperties>>>>>;
  public isSaving = false;
  private elementToEdit: SectionElement;
  private mode: EDITOR_MODE;

  constructor(
    private formDataParser: FormDataParserService,
    private router: Router,
    private store: Store<ReducerTypes>
  ) { }

  public ngOnInit(): void {
    this.setElement();
    this.setMode();
    this.store.select('project')
      .pipe(takeWhile(() => this.watchProject))
      .subscribe(project => this.setFormDataForSection(project));
  }

  public ngOnDestroy(): void {
    this.watchProject = false;
  }

  public async save(formData: FormGroup): Promise<void> {
    this.isSaving = true;
    const elementSaved = await new ElementSaver(this.project[RESERVED_UDS_KEYS._settings][0].id, this.section.id, formData.value, this.mode).save();
    this.isSaving = false;

    if (this.mode === EDITOR_MODE.add)
      this.router.navigate(['/private/project/', this.project[RESERVED_UDS_KEYS._settings][0].id, 'list', this.section.id]);
    else
      this.router.navigateByUrl(previousRoutes[0].url, { state: { element: elementSaved } });
  }

  public cancel(): void {
    this.router.navigateByUrl(previousRoutes[0].url, { state: { element: this.elementToEdit } });
  }

  /**
   * Sets the element to edit, if any, based on the object passed to `history.state` by `Router`
   * No element is expected in `add` mode. In add mode formDataParser will use an empty Object as default value.
   */
  private setElement(): void {
    if (history.state.element)
      this.elementToEdit = history.state.element;
  }

  private setMode(): void {
    this.mode = currentRouteConstant.data.mode;
  }

  private setFormDataForSection(project: SystemData): void {
    this.project = project;
    this.section = project[RESERVED_UDS_KEYS._sections].find(sectionToCheck => sectionToCheck.id === currentRouteConstant.params[URL_PARAMS.sectionId]);

    if (!this.section)
      return;

    const formDataModel = new ComponentCodeToName(this.section.formModel).parse();
    this.sectionEles = this.formDataParser.make({
      formDataModel,
      section: this.section.id,
      element: this.elementToEdit,
      childOf: this.section.childOf,
      sections: project[RESERVED_UDS_KEYS._sections]
    });
    console.log('setFormDataForSection ~ this.sectionEles', this.sectionEles);
  }

}
