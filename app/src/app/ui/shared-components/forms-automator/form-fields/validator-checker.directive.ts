import {
  Directive,
  ElementRef,
  HostBinding,
  Input,
  OnChanges,
  OnInit
  } from '@angular/core';

@Directive({
  // tslint:disable-next-line:directive-selector
  selector: '[appValidatorChecker]'
})
export class ValidatorCheckerDirective implements OnInit, OnChanges {

  @HostBinding('class')
  public elementClass = 'form-control';

  public type: string;

  @Input()
  public invalid: boolean;

  @Input()
  public touched: boolean;

  @Input()
  public currentValue: any;

  private baseClass: 'form-control' | 'custom-control-input' | 'custom-select';

  constructor(
    private elRef: ElementRef
  ) { }

  public ngOnInit(): void {
    switch (this.elRef.nativeElement.type) {
      case 'checkbox':
        this.baseClass = 'custom-control-input';
        break;
      case 'select-one':
        this.baseClass = 'custom-select';
        break;
      default:
        this.baseClass = 'form-control';
    }
    this.setClass();
  }

  public ngOnChanges(): void {
    this.setClass();
  }

  private setClass(): void {
    switch (true) {
      case (this.touched === false && !this.currentValue):
        this.elementClass = this.baseClass;
        break;
      case (this.invalid):
        this.elementClass = `is-invalid ${this.baseClass}`;
        break;
      default:
        this.elementClass = `is-valid ${this.baseClass}`;
        break;
    }
  }
}
