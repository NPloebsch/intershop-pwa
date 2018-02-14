import { createSelector } from '@ngrx/store';
import * as fromRouter from '../../../core/store/router';
import { Product } from '../../../models/product/product.model';
import * as fromFeature from '../reducers';
import * as fromProducts from '../reducers/products.reducer';

export const getProductsState = createSelector(
  fromFeature.getShoppingState, (state: fromFeature.ShoppingState) => state.products
);

export const getProductEntities = createSelector(
  getProductsState,
  fromProducts.getProductEntities
);

export const getSelectedProduct = createSelector(
  getProductEntities,
  fromRouter.getRouterState,
  (entities, router): Product => {
    return router.state && entities[router.state.params.sku];
  }
);

export const getProductLoaded = createSelector(
  getProductsState,
  fromProducts.getProductLoaded
);

export const getProductLoading = createSelector(
  getProductsState,
  fromProducts.getProductLoading
);
