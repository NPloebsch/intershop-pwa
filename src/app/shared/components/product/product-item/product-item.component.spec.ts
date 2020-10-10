import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockComponent } from 'ng-mocks';
import { of } from 'rxjs';
import { anything, capture, instance, mock, verify, when } from 'ts-mockito';

import { ProductContextFacade } from 'ish-core/facades/product-context.facade';
import { VariationProductView } from 'ish-core/models/product-view/product-view.model';
import { LoadingComponent } from 'ish-shared/components/common/loading/loading.component';
import { ProductRowComponent } from 'ish-shared/components/product/product-row/product-row.component';
import { ProductTileComponent } from 'ish-shared/components/product/product-tile/product-tile.component';

import { ProductItemComponent } from './product-item.component';

describe('Product Item Component', () => {
  let component: ProductItemComponent;
  let fixture: ComponentFixture<ProductItemComponent>;
  let element: HTMLElement;
  let context: ProductContextFacade;

  beforeEach(async () => {
    context = mock(ProductContextFacade);
    await TestBed.configureTestingModule({
      declarations: [
        MockComponent(LoadingComponent),
        MockComponent(ProductRowComponent),
        MockComponent(ProductTileComponent),
        ProductItemComponent,
      ],
    })
      .overrideComponent(ProductItemComponent, {
        set: { providers: [{ provide: ProductContextFacade, useFactory: () => instance(context) }] },
      })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductItemComponent);
    component = fixture.componentInstance;
    element = fixture.nativeElement;
    component.productSku = 'sku';
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
    expect(element).toBeTruthy();
    expect(() => fixture.detectChanges()).not.toThrow();
  });

  describe('with variation product', () => {
    beforeEach(() => {
      const variation = {
        sku: 'sku',
        type: 'VariationProduct',
        variations: () => [
          {
            sku: 'skuV2',
            variableVariationAttributes: [{ variationAttributeId: 'HDD', value: '256' }],
          },
        ],
      } as VariationProductView;
      when(context.select('product')).thenReturn(of(variation));
    });

    it('should trigger add product to cart with right sku', () => {
      expect(() => fixture.detectChanges()).not.toThrow();

      component.addToBasket(3);

      verify(context.addToBasket(anything())).once();
      expect(capture(context.addToBasket).last()).toMatchInlineSnapshot(`
        Array [
          3,
        ]
      `);
    });
  });
});
