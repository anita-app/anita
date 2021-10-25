import {
  Component,
  Input,
  OnDestroy,
  OnInit
  } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { OptionKeysModel } from '@anita/client/data/model/form-model-commons';
import { SectionDetailsDeclaration } from '@anita/client/data/model/project-info';
import { ReducerTypes } from '@anita/client/libs/ng-rx/reducers.const';
import { BasicSelect } from '@anita/client/ui/shared-components/forms-automator/form-fields/form-fields-model';
import { Store } from '@ngrx/store';
import { takeWhile } from 'rxjs/operators';

@Component({
  selector: 'app-child-of-selector-for-section',
  templateUrl: './child-of-selector-for-section.component.html',
  styleUrls: ['./child-of-selector-for-section.component.scss']
})
export class ChildOfSelectorForSectionComponent implements OnInit, OnDestroy {

  @Input()
  public formEle: BasicSelect<SectionDetailsDeclaration>;

  @Input()
  public formData: FormGroup;

  public selectableSections: Array<OptionKeysModel> = [];

  private alive = true;

  constructor(
    private store: Store<ReducerTypes>
  ) { }

  public ngOnInit(): void {
    this.store.select('sectionsForChildOfSelector')
      .pipe(takeWhile(() => this.alive))
      .subscribe(sectionsForChildOfSelector => this.makeSelectableSections(sectionsForChildOfSelector));
  }

  public ngOnDestroy(): void {
    this.alive = false;
  }

  public trackItems(index: number, item: OptionKeysModel): string | number {
    return item.value;
  }

  private makeSelectableSections(sectionsForChildOfSelector: Array<SectionDetailsDeclaration>): void {
    this.selectableSections.length = 0;
    sectionsForChildOfSelector.forEach(sectionDec => {
      if (sectionDec.id !== this.formData.value.id)
        this.selectableSections.push({
          value: sectionDec.id,
          txt: sectionDec.title
        });
    });

  }

}
