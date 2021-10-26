import {
  Component,
  Input,
  OnDestroy,
  OnInit
  } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { dbInstances } from '@anita/client/data/db-instances.const';
import { OptionKeysModel, OptionKeysModelGroup } from '@anita/client/data/model/form-model-commons';
import { RESERVED_UDS_KEYS, SectionElement, SystemData } from '@anita/client/data/model/project-info';
import { ReducerTypes } from '@anita/client/libs/ng-rx/reducers.const';
import { findFirstUserDefinedField } from '@anita/client/libs/tools/find-first-user-defined-field.function';
import { findSectionById } from '@anita/client/libs/tools/find-section-by-id.function';
import { asyncForEach } from '@anita/client/libs/tools/tools';
import { AbstractElement } from '@anita/client/ui/shared-components/forms-automator/form-fields/abstract-element';
import { BasicSelect, FormModel } from '@anita/client/ui/shared-components/forms-automator/form-fields/form-fields-model';
import { Store } from '@ngrx/store';
import { takeWhile } from 'rxjs/operators';

@Component({
  selector: 'app-parents-selector',
  templateUrl: './parents-selector.component.html',
  styleUrls: ['./parents-selector.component.scss']
})
export class ParentsSelectorComponent implements OnDestroy, OnInit {

  @Input()
  public formEle: BasicSelect<AbstractElement>;

  @Input()
  public formData: FormGroup;

  public optionsGroups: Array<OptionKeysModelGroup> = [];
  private watchProject = true;
  private project: SystemData;

  constructor(
    private store: Store<ReducerTypes>
  ) { }

  public ngOnInit(): void {
    this.store.select('project')
      .pipe(takeWhile(() => this.watchProject))
      .subscribe(project => this.setProjectId(project));
  }

  public ngOnDestroy(): void {
    // We unsubscribe otherwise it would keep fetching data after closing the list view
    this.watchProject = false;
  }

  public trackGroups(index: number, item: OptionKeysModelGroup): string | number {
    return item.value;
  }

  public trackOptions(index: number, item: OptionKeysModel): string | number {
    return item.value;
  }

  private setProjectId(project: SystemData): void {
    if (typeof project === 'undefined')
      return;

    this.project = project;

    this.buildOptions();
  }

  private async buildOptions(): Promise<void> {
    await asyncForEach(this.formEle.options, async group => {
      const sectionEles = await dbInstances[this.project[RESERVED_UDS_KEYS._settings][0].id].callSelector<SectionElement>(group.value).multiple();
      if (sectionEles.length)
        this.createGroupOption(group.value as string, group.txt, sectionEles);
    });
  }

  private createGroupOption(sectionId: string, sectionLabel: string, sectionEles: Array<SectionElement>): void {
    const options: Array<OptionKeysModel> = [];
    const section = findSectionById(this.project[RESERVED_UDS_KEYS._sections], sectionId);
    const indexFirstUserFiield = findFirstUserDefinedField(section.formModel as FormModel);
    sectionEles.forEach(ele => options.push({
      value: `${sectionId}|${ele.id}`,
      txt: ele[section.formModel[indexFirstUserFiield].fieldName]
    }));
    this.optionsGroups.push({
      value: sectionId,
      txt: sectionLabel,
      options
    });
  }

}
