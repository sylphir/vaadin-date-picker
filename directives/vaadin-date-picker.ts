import {
  Injector,
  OnInit,
  Directive,
  ElementRef,
  Output,
  HostListener,
  EventEmitter,
  Provider,
  forwardRef,
  Renderer
} from 'angular2/core';
import { NgControl, NG_VALUE_ACCESSOR, DefaultValueAccessor } from 'angular2/common';
import { CONST_EXPR } from 'angular2/src/facade/lang';
declare var HTMLImports;

const VAADIN_DATE_PICKER_CONTROL_VALUE_ACCESSOR = CONST_EXPR(new Provider(
    NG_VALUE_ACCESSOR, {
      useExisting: forwardRef(() => VaadinDatePicker),
      multi: true
    }));

@Directive({
  selector: 'vaadin-date-picker',
  providers: [VAADIN_DATE_PICKER_CONTROL_VALUE_ACCESSOR]
})
export class VaadinDatePicker extends DefaultValueAccessor implements OnInit {

  private _element;
  private _control;
  private _initialValueSet = false;

  ngOnInit() {
    this._control = this._injector.getOptional(NgControl);
  }

  @Output() valueChange: EventEmitter<any> = new EventEmitter(false);
  @HostListener('value-changed', ['$event.detail.value'])
  valuechanged(value) {
    this.valueChange.emit(value);

    if (this._initialValueSet) {
      // Do not trigger onChange when the initial (empty) value is set
      // to keep the field as "pristine".
      this.onChange(value);
    } else {
      this._initialValueSet = true;
    }

    // Pass the invalid state to our native vaadin-date-picker element if
    // it is an ngControl.
    if (this._control != null) {
      this._element.invalid = !this._control.pristine && !this._control.valid;
    }
  }

  importHref(href) {
    if (!document.querySelector('head link[href="' + href + '"]')) {
      const link = document.createElement('link');
      link.rel = 'import';
      link.href = href;
      document.head.appendChild(link);
    }
    HTMLImports.whenReady(this.onImport.bind(this));
  }

  onImport() {
    this._element.$$('paper-input-container').addEventListener('blur', () => {
      if (!this._element.opened && !this._element._opened) {
        this.onTouched();
      }
    });
  }

  constructor(renderer: Renderer, el: ElementRef,  private _injector: Injector) {
    super(renderer, el);
    this._element = el.nativeElement;
    this.importHref('bower_components/vaadin-date-picker/vaadin-date-picker.html');
  }

}