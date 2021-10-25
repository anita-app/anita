import {
  AfterContentChecked,
  ChangeDetectorRef,
  Component,
  OnInit
  } from '@angular/core';
import { Router } from '@angular/router';
import { CLIENT_SECTIONS } from '@anita/client/data/client-sections.enum';
import { projects } from '@anita/client/data/form-models/projects.constant';
import { AnitaUniversalDataStorage, ProjectSettings, RESERVED_UDS_KEYS } from '@anita/client/data/model/project-info';
import { IdCreator } from '@anita/client/libs/id-creator/id-creator.class';
import { REDUCER_ACTIONS } from '@anita/client/libs/ng-rx/ngrx-actions.const';
import { ProjectSaver } from '@anita/client/libs/projects-helpers/project-handlers/project-saver.class';
import { currentRouteConstant } from '@anita/client/ng-services/app-routing/current-route.constant';
import { stateData } from '@anita/client/ng-services/state-data/state-data.constant';
import { EDITOR_MODE } from '@anita/client/ui/editor-mode.enum';
import { FormInfoForBuilder } from '@anita/client/ui/shared-components/forms-automator/form-builder/form-builder';
import { FormDataParserService } from '@anita/client/ui/shared-components/forms-automator/form-builder/services/form-data-parser.service';
import { FormModel } from '@anita/client/ui/shared-components/forms-automator/form-fields/form-fields-model';
import { select } from '@ngrx/store';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-project-editor',
  templateUrl: './project-editor.component.html'
})
export class ProjectEditorComponent implements OnInit, AfterContentChecked {

  public dataStructureEles: Array<Array<Array<FormInfoForBuilder<FormModel>>>> = [];
  public isSaving = false;
  public allIsValid: { state: boolean } = { state: false };
  public projectFormEles = projects;
  public projectForm: FormInfoForBuilder<FormModel>;
  private projectSettingsToEdit: ProjectSettings;

  constructor(
    private formDataParser: FormDataParserService,
    private router: Router,
    private cdref: ChangeDetectorRef
  ) { }

  public ngOnInit(): void {
    stateData.ngRxStore.dispatch(REDUCER_ACTIONS.resetSectionForChildOfSelector());
    this.setData();
  }

  public ngAfterContentChecked(): void {
    this.cdref.detectChanges();
  }

  public addSection(): void {
    this.dataStructureEles.push([[]]);
  }

  public async save(): Promise<void> {
    this.isSaving = true;
    const projectSaved = await new ProjectSaver(this.projectForm.formData.value, this.dataStructureEles, currentRouteConstant.data.mode).save();
    this.isSaving = false;
    this.router.navigate(['/private/project', projectSaved[RESERVED_UDS_KEYS._settings][0].id, 'info']);
  }

  private async setData(): Promise<void> {
    if (currentRouteConstant.data.mode === EDITOR_MODE.edit)
      await this.setProjectDataToEdit();
    else
      this.addSection();
    this.setProjectForm();
  }

  /**
   * Sets the existing data of the project to edit and creates an empty `Array<Array<FormModel>> for each section by calling `addSection`.
   * It does not need to set the data of the section to be edited as it is set in the `SectionEditorComponent`
   */
  private async setProjectDataToEdit(): Promise<void> {
    const project = await stateData.ngRxStore.pipe(select('project'), take(1)).toPromise<AnitaUniversalDataStorage>();
    this.projectSettingsToEdit = project[RESERVED_UDS_KEYS._settings][0];
    project[RESERVED_UDS_KEYS._sections].forEach(() => this.addSection());
  }

  private setProjectForm(): void {
    const formDataParserOptions = {
      formDataModel: this.projectFormEles as any,
      section: CLIENT_SECTIONS.projects,
      element: this.projectSettingsToEdit ? this.projectSettingsToEdit : { id: IdCreator.random() }
    };
    this.projectForm = this.formDataParser.make(formDataParserOptions);
  }

  public cancel(): void {
    this.router.navigate(['/private/projects/list']);
  }

}
