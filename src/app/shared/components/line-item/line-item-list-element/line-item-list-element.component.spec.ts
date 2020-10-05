import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { MockComponent, MockPipe } from 'ng-mocks';
import { of } from 'rxjs';
import { instance, mock, when } from 'ts-mockito';

import { ProductContextFacade } from 'ish-core/facades/product-context.facade';
import { FeatureToggleModule } from 'ish-core/feature-toggle.module';
import { PricePipe } from 'ish-core/models/price/price.pipe';
import { ProductView } from 'ish-core/models/product-view/product-view.model';
import { ProductRoutePipe } from 'ish-core/routing/product/product-route.pipe';
import { BasketMockData } from 'ish-core/utils/dev/basket-mock-data';
import { findAllCustomElements } from 'ish-core/utils/dev/html-query-utils';
import { BasketPromotionComponent } from 'ish-shared/components/basket/basket-promotion/basket-promotion.component';
import { LineItemEditComponent } from 'ish-shared/components/line-item/line-item-edit/line-item-edit.component';
import { ProductBundleDisplayComponent } from 'ish-shared/components/product/product-bundle-display/product-bundle-display.component';
import { ProductIdComponent } from 'ish-shared/components/product/product-id/product-id.component';
import { ProductInventoryComponent } from 'ish-shared/components/product/product-inventory/product-inventory.component';
import { ProductShipmentComponent } from 'ish-shared/components/product/product-shipment/product-shipment.component';
import { ProductVariationDisplayComponent } from 'ish-shared/components/product/product-variation-display/product-variation-display.component';
import { InputComponent } from 'ish-shared/forms/components/input/input.component';
import { ProductImageComponent } from 'ish-shell/header/product-image/product-image.component';

import { LazyProductAddToOrderTemplateComponent } from '../../../../extensions/order-templates/exports/lazy-product-add-to-order-template/lazy-product-add-to-order-template.component';
import { LazyProductAddToWishlistComponent } from '../../../../extensions/wishlists/exports/lazy-product-add-to-wishlist/lazy-product-add-to-wishlist.component';

import { LineItemListElementComponent } from './line-item-list-element.component';

describe('Line Item List Element Component', () => {
  let component: LineItemListElementComponent;
  let fixture: ComponentFixture<LineItemListElementComponent>;
  let element: HTMLElement;
  let context: ProductContextFacade;

  beforeEach(async () => {
    context = mock(ProductContextFacade);
    when(context.select('product')).thenReturn(of({} as ProductView));

    await TestBed.configureTestingModule({
      imports: [FeatureToggleModule.forTesting(), RouterTestingModule, TranslateModule.forRoot()],
      declarations: [
        LineItemListElementComponent,
        MockComponent(BasketPromotionComponent),
        MockComponent(FaIconComponent),
        MockComponent(InputComponent),
        MockComponent(LazyProductAddToOrderTemplateComponent),
        MockComponent(LazyProductAddToWishlistComponent),
        MockComponent(LineItemEditComponent),
        MockComponent(NgbPopover),
        MockComponent(ProductBundleDisplayComponent),
        MockComponent(ProductIdComponent),
        MockComponent(ProductImageComponent),
        MockComponent(ProductInventoryComponent),
        MockComponent(ProductShipmentComponent),
        MockComponent(ProductVariationDisplayComponent),
        MockPipe(PricePipe),
        MockPipe(ProductRoutePipe),
      ],
    })
      .overrideComponent(LineItemListElementComponent, {
        set: { providers: [{ provide: ProductContextFacade, useFactory: () => instance(context) }] },
      })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LineItemListElementComponent);
    component = fixture.componentInstance;
    element = fixture.nativeElement;
    component.pli = BasketMockData.getBasketItem();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
    expect(element).toBeTruthy();
    expect(() => fixture.detectChanges()).not.toThrow();
  });

  describe('editable', () => {
    beforeEach(() => {
      component.editable = true;
    });

    it('should render item quantity change input field if editable === true', () => {
      fixture.detectChanges();
      expect(element.querySelector('ish-input[controlname=quantity]')).toBeTruthy();
    });

    it('should not render item quantity change input field if editable === false', () => {
      component.editable = false;
      fixture.detectChanges();
      expect(element.querySelector('ish-input[controlname=quantity]')).not.toBeTruthy();
    });

    it('should render item delete button if editable === true', () => {
      fixture.detectChanges();
      expect(element.querySelector('fa-icon[ng-reflect-icon="fas,trash-alt"]')).toBeTruthy();
    });

    it('should not render item delete button if editable === false', () => {
      component.editable = false;
      fixture.detectChanges();
      expect(element.querySelector('fa-icon[ng-reflect-icon="fas,trash-alt"]')).toBeFalsy();
    });
  });

  it('should give correct sku to productIdComponent', () => {
    fixture.detectChanges();
    expect(element.querySelector('ish-product-id')).toMatchInlineSnapshot(`<ish-product-id></ish-product-id>`);
  });

  it('should hold itemSurcharges for the line item', () => {
    fixture.detectChanges();
    expect(element.querySelectorAll('.details-tooltip')).toHaveLength(1);
  });

  it('should not display itemSurcharges for the line item if not available', () => {
    component.pli = { ...BasketMockData.getBasketItem(), itemSurcharges: undefined };
    expect(() => fixture.detectChanges()).not.toThrow();
    expect(element.querySelectorAll('.details-tooltip')).toHaveLength(0);
  });

  it('should display standard elements for normal products', () => {
    fixture.detectChanges();
    expect(findAllCustomElements(element)).toMatchInlineSnapshot(`
      Array [
        "ish-product-image",
        "ish-product-id",
        "ish-line-item-edit",
        "ish-product-inventory",
        "ish-product-shipment",
        "fa-icon",
        "ish-lazy-product-add-to-order-template",
        "ish-lazy-product-add-to-wishlist",
        "fa-icon",
        "ish-input",
        "ish-input",
      ]
    `);
  });

  it('should display bundle parts for bundle products', () => {
    when(context.select('product')).thenReturn(of({ type: 'Bundle' } as ProductView));
    fixture.detectChanges();
    expect(findAllCustomElements(element)).toContain('ish-product-bundle-display');
  });

  it('should not display edit component for variation products with advanced variation handling', () => {
    when(context.select('product')).thenReturn(of({ type: 'VariationProduct' } as ProductView));
    FeatureToggleModule.switchTestingFeatures('advancedVariationHandling');
    fixture.detectChanges();
    expect(findAllCustomElements(element)).not.toContain('ish-line-item-edit');
  });
});
