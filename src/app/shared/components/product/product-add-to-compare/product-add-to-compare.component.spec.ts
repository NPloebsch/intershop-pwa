import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { TranslateModule } from '@ngx-translate/core';
import { MockComponent } from 'ng-mocks';
import { of } from 'rxjs';
import { instance, mock, verify, when } from 'ts-mockito';

import { ProductContextFacade } from 'ish-core/facades/product-context.facade';
import { FeatureToggleModule } from 'ish-core/feature-toggle.module';

import { ProductAddToCompareComponent } from './product-add-to-compare.component';

describe('Product Add To Compare Component', () => {
  let component: ProductAddToCompareComponent;
  let fixture: ComponentFixture<ProductAddToCompareComponent>;
  let element: HTMLElement;
  let context: ProductContextFacade;

  beforeEach(async () => {
    context = mock(ProductContextFacade);
    await TestBed.configureTestingModule({
      imports: [FeatureToggleModule.forTesting('compare'), RouterTestingModule, TranslateModule.forRoot()],
      declarations: [MockComponent(FaIconComponent), ProductAddToCompareComponent],
      providers: [{ provide: ProductContextFacade, useFactory: () => instance(context) }],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductAddToCompareComponent);
    component = fixture.componentInstance;
    element = fixture.nativeElement;
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
    expect(element).toBeTruthy();
    expect(() => fixture.detectChanges()).not.toThrow();
  });

  it('should show muted button when "isInCompareList" is set to "true" ', () => {
    when(context.select('isInCompareList')).thenReturn(of(true));
    fixture.detectChanges();
    expect(element.querySelector('button').className).toContain('is-selected');
  });

  it('should show normal button when "isInCompareList" is set to "false" ', () => {
    when(context.select('isInCompareList')).thenReturn(of(false));
    fixture.detectChanges();
    expect(element.querySelector('button').className).toBe('btn add-to-compare');
  });

  it('should not show an icon when display type is not icon ', () => {
    fixture.detectChanges();
    expect(element.querySelector('fa-icon')).toBeFalsy();
  });

  it('should show icon button when display type is icon ', () => {
    component.displayType = 'icon';
    fixture.detectChanges();
    expect(element.querySelector('fa-icon')).toBeTruthy();
  });

  it('should detect errors on emitter using spy', () => {
    component.toggleCompare();

    verify(context.toggleCompare()).once();
  });
});
