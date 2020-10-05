import { Injectable } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { RxState } from '@rx-angular/state';
import { combineLatest } from 'rxjs';
import { filter, map, startWith, switchMap, tap } from 'rxjs/operators';

import { VariationProductView } from 'ish-core/models/product-view/product-view.model';
import { AnyProductViewType, ProductCompletenessLevel, ProductHelper } from 'ish-core/models/product/product.model';
import { addProductToBasket } from 'ish-core/store/customer/basket';
import { addToCompare, isInCompareProducts, toggleCompare } from 'ish-core/store/shopping/compare';
import { getProduct, loadProductIfNotLoaded } from 'ish-core/store/shopping/products';
import { whenTruthy } from 'ish-core/utils/operators';

@Injectable()
export class ProductContextFacade extends RxState<{
  sku: string;
  requiredCompletenessLevel: ProductCompletenessLevel;
  product: AnyProductViewType;
  productAsVariationProduct: VariationProductView;
  loading: boolean;
  isInCompareList: boolean;
}> {
  constructor(private store: Store) {
    super();

    this.set('requiredCompletenessLevel', () => ProductCompletenessLevel.List);

    this.connect(
      combineLatest([
        this.select('sku').pipe(whenTruthy()),
        this.select('requiredCompletenessLevel').pipe(whenTruthy()),
      ]).pipe(
        filter(([sku, level]) => !!sku && !!level),
        tap(([sku, level]) => store.dispatch(loadProductIfNotLoaded({ sku, level }))),
        switchMap(([sku, level]) =>
          store.pipe(
            select(getProduct, { sku }),
            filter(p => ProductHelper.isReadyForDisplay(p, level)),
            map(product => ({ product, loading: false })),
            startWith({ loading: true })
          )
        )
      )
    );

    this.connect('productAsVariationProduct', this.select('product').pipe(filter(ProductHelper.isVariationProduct)));

    this.connect(
      'isInCompareList',
      this.select('sku').pipe(switchMap(sku => this.store.pipe(select(isInCompareProducts(sku)))))
    );

    // tslint:disable-next-line: no-console
    this.hold(this.$, ctx => console.log(ctx));
  }

  addToBasket(quantity: number) {
    this.store.dispatch(addProductToBasket({ sku: this.get('sku'), quantity }));
  }

  toggleCompare() {
    this.store.dispatch(toggleCompare({ sku: this.get('sku') }));
  }

  addToCompare() {
    this.store.dispatch(addToCompare({ sku: this.get('sku') }));
  }
}
