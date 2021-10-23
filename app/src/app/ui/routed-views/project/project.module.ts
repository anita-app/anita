import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ProjectInfoComponent } from '@anita/client/ui/routed-views/project/components/project-info/project-info.component';
import { SectionElementEditorComponent } from '@anita/client/ui/routed-views/project/components/section-element-editor/section-element-editor.component';
import { SectionListComponent } from '@anita/client/ui/routed-views/project/components/section-elements-list/section-list.component';
import { TxtByFieldValue } from '@anita/client/ui/routed-views/project/pipes/txt-by-field-value.pipe';
import { AddButtonModule } from '@anita/client/ui/shared-components/add-btn/add-button.module';
import { ThemeModule } from '@anita/client/ui/shared-components/admin/@theme/theme.module';
import { FormBuilderModule } from '@anita/client/ui/shared-components/forms-automator/form-builder/form-builder.module';
import {
  NbAccordionModule,
  NbButtonModule,
  NbCardModule,
  NbInputModule,
  NbListModule,
  NbSpinnerModule,
  NbTabsetModule,
  NbTooltipModule,
  NbTreeGridModule
  } from '@nebular/theme';
import { ElementValueViewerComponent } from './components/element-value-viewer/element-value-viewer.component';
import { NoElementsComponent } from './components/no-elements/no-elements.component';
import { ProjectDetailsComponent } from './components/project-details/project-details.component';
import { SectionElementDetailsComponent } from './components/section-element-details/section-element-details.component';
import { ElementsListComponent } from './components/section-elements-list/elements-list/elements-list.component';
import { SectionByIdPipe } from './pipes/section-by-id.pipe';

@NgModule({
  imports: [
    CommonModule,
    FormBuilderModule,
    RouterModule,
    ThemeModule,
    NbCardModule,
    NbButtonModule,
    AddButtonModule,
    NbSpinnerModule,
    NbAccordionModule,
    NbTooltipModule,
    NbListModule,
    NbTabsetModule,
    NbTreeGridModule,
    NbInputModule
  ],
  declarations: [
    ProjectInfoComponent,
    SectionListComponent,
    NoElementsComponent,
    SectionByIdPipe,
    TxtByFieldValue,
    SectionElementEditorComponent,
    ElementsListComponent,
    SectionElementDetailsComponent,
    ProjectDetailsComponent,
    ElementValueViewerComponent
  ]
})
export class ProjectModule { }
