import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { SectionElement } from '@anita/client/data/model/project-info';

@Component({
  selector: 'app-add-btn',
  templateUrl: './add-btn.component.html',
  styleUrls: ['./add-btn.component.scss']
})
export class AddBtnComponent {

  @Input()
  public url: string;

  @Input()
  public icon = 'plus-outline';

  @Input()
  public element: SectionElement;

  constructor(
    private router: Router
  ) { }

  public navigate(): void {
    this.router.navigateByUrl(this.url, {
      state: { element: this.element }
    });

  }

}
