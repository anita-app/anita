import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AddBtnComponent } from '@anita/client/ui/shared-components/add-btn/add-btn.component';
import { NbButtonModule, NbIconModule } from '@nebular/theme';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    NbButtonModule,
    NbIconModule
  ],
  declarations: [
    AddBtnComponent
  ],
  exports: [
    AddBtnComponent
  ]
})
export class AddButtonModule { }
