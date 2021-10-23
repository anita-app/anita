import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ProjectModule } from '@anita/client/ui/routed-views/project/project.module';
import { ProjectsModule } from '@anita/client/ui/routed-views/projects/projects.module';
import { ThemeModule } from '@anita/client/ui/shared-components/admin/@theme/theme.module';
import { AdminComponent } from '@anita/client/ui/shared-components/admin/admin.component';
import { NbDialogService } from '@nebular/theme';

@NgModule({
  declarations: [AdminComponent],
  imports: [
    CommonModule,
    RouterModule,
    ThemeModule,
    ProjectsModule,
    ProjectModule
  ],
  providers: [NbDialogService],
  exports: [AdminComponent]
})
export class AdminModule { }
