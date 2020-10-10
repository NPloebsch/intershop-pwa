import { ApplicationRef, ChangeDetectionStrategy, Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, ReplaySubject, Subject, of } from 'rxjs';
import { filter, map, switchMap, take, takeUntil, withLatestFrom } from 'rxjs/operators';

import { ProductContextFacade } from 'ish-core/facades/product-context.facade';
import { ShoppingFacade } from 'ish-core/facades/shopping.facade';
import { FeatureToggleService } from 'ish-core/feature-toggle.module';
import { CategoryView } from 'ish-core/models/category-view/category-view.model';
import { ProductVariationHelper } from 'ish-core/models/product-variation/product-variation.helper';
import {
  ProductView,
  VariationProductMasterView,
  VariationProductView,
} from 'ish-core/models/product-view/product-view.model';
import {
  ProductCompletenessLevel,
  ProductHelper,
  ProductPrices,
  SkuQuantityType,
} from 'ish-core/models/product/product.model';
import { generateProductUrl } from 'ish-core/routing/product/product.route';
import { whenTruthy } from 'ish-core/utils/operators';

@Component({
  selector: 'ish-product-page',
  templateUrl: './product-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ProductContextFacade],
})
export class ProductPageComponent implements OnInit, OnDestroy {
  product$: Observable<ProductView | VariationProductView | VariationProductMasterView>;
  productLoading$: Observable<boolean>;
  category$: Observable<CategoryView>;

  quantity: number;
  price$: Observable<ProductPrices>;

  isProductBundle = ProductHelper.isProductBundle;
  isRetailSet = ProductHelper.isRetailSet;
  isMasterProduct = ProductHelper.isMasterProduct;

  private destroy$ = new Subject();
  retailSetParts$ = new ReplaySubject<SkuQuantityType[]>(1);

  constructor(
    private shoppingFacade: ShoppingFacade,
    private router: Router,
    private featureToggleService: FeatureToggleService,
    private appRef: ApplicationRef,
    private ngZone: NgZone,
    private context: ProductContextFacade
  ) {}

  ngOnInit() {
    this.context.set('requiredCompletenessLevel', () => ProductCompletenessLevel.Detail);
    this.context.connect('sku', this.shoppingFacade.selectedProductId$);

    this.context.hold(this.context.select('productAsVariationProduct'), product => this.redirectToVariation(product));

    this.product$ = this.context.select('product');
    this.productLoading$ = this.context.select('loading');

    this.category$ = this.shoppingFacade.selectedCategory$;

    this.product$.pipe(whenTruthy(), takeUntil(this.destroy$)).subscribe(product => {
      this.quantity = product.minOrderQuantity;
      if (
        ProductHelper.isMasterProduct(product) &&
        ProductVariationHelper.hasDefaultVariation(product) &&
        !this.featureToggleService.enabled('advancedVariationHandling')
      ) {
        this.redirectToVariation(product.defaultVariation(), true);
      }
      if (ProductHelper.isMasterProduct(product) && this.featureToggleService.enabled('advancedVariationHandling')) {
        this.shoppingFacade.loadMoreProducts({ type: 'master', value: product.sku }, 1);
      }
      this.retailSetParts$.next(
        ProductHelper.isRetailSet(product) ? product.partSKUs.map(sku => ({ sku, quantity: 1 })) : []
      );
    });

    this.price$ = this.product$.pipe(
      switchMap(product => {
        if (ProductHelper.isRetailSet(product)) {
          return this.retailSetParts$.pipe(
            filter(parts => !!parts && !!parts.length),
            switchMap(parts =>
              this.shoppingFacade.products$(parts.map(part => part.sku)).pipe(
                filter(products =>
                  products.every(p => ProductHelper.isSufficientlyLoaded(p, ProductCompletenessLevel.List))
                ),
                map(ProductHelper.calculatePriceRange)
              )
            )
          );
        } else {
          return of(undefined);
        }
      })
    );
  }

  addToBasket() {
    this.product$
      .pipe(take(1), whenTruthy(), withLatestFrom(this.retailSetParts$), takeUntil(this.destroy$))
      .subscribe(([product, parts]) => {
        if (ProductHelper.isRetailSet(product)) {
          parts
            .filter(({ quantity }) => !!quantity)
            .forEach(({ sku, quantity }) => {
              this.shoppingFacade.addProductToBasket(sku, quantity);
            });
        } else {
          this.shoppingFacade.addProductToBasket(product.sku, this.quantity);
        }
      });
  }

  redirectToVariation(variation: VariationProductView, replaceUrl = false) {
    this.appRef.isStable
      .pipe(
        whenTruthy(),
        take(1),
        map(() => variation),
        whenTruthy(),
        withLatestFrom(this.shoppingFacade.selectedCategory$),
        takeUntil(this.destroy$)
      )
      .subscribe(([product, category]) => {
        this.ngZone.run(() => {
          this.router.navigateByUrl(generateProductUrl(product, category), { replaceUrl });
        });
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
