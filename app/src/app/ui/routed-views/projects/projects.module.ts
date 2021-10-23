import { CommonModule, DatePipe } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NoProjectsComponent } from '@anita/client/ui/routed-views/projects/components/no-projects/no-projects.component';
import { ProjectEditorComponent } from '@anita/client/ui/routed-views/projects/components/project-editor/project-editor.component';
import { SectionEditorComponent } from '@anita/client/ui/routed-views/projects/components/project-editor/section-editor/section-editor.component';
import { ProjectCardComponent } from '@anita/client/ui/routed-views/projects/components/projects-list/components/project-card/project-card.component';
import { ProjectDeleteConfirmComponent } from '@anita/client/ui/routed-views/projects/components/projects-list/components/project-delete-confirm/project-delete-confirm.component';
import { ProjectSelectBtnComponent } from '@anita/client/ui/routed-views/projects/components/projects-list/components/project-select-btn/project-select-btn.component';
import { ProjectsListComponent } from '@anita/client/ui/routed-views/projects/components/projects-list/projects-list.component';
import { AddButtonModule } from '@anita/client/ui/shared-components/add-btn/add-button.module';
import { ThemeModule } from '@anita/client/ui/shared-components/admin/@theme/theme.module';
import { FormBuilderModule } from '@anita/client/ui/shared-components/forms-automator/form-builder/form-builder.module';
import {
  NbAccordionModule,
  NbButtonModule,
  NbCardModule,
  NbCheckboxModule,
  NbDialogModule,
  NbIconModule,
  NbListModule,
  NbSpinnerModule,
  NbTooltipModule
  } from '@nebular/theme';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ThemeModule,
    AddButtonModule,
    ReactiveFormsModule,
    FormBuilderModule,
    NbTooltipModule,
    NbCardModule,
    NbDialogModule,
    NbButtonModule,
    NbAccordionModule,
    NbListModule,
    NbSpinnerModule,
    NbCheckboxModule,
    NbIconModule
  ],
  declarations: [
    ProjectsListComponent,
    ProjectEditorComponent,
    NoProjectsComponent,
    ProjectCardComponent,
    ProjectSelectBtnComponent,
    ProjectDeleteConfirmComponent,
    SectionEditorComponent
  ],
  providers: [
    DatePipe
  ],
  entryComponents: [
    ProjectDeleteConfirmComponent
  ]
})
export class ProjectsModule { }
