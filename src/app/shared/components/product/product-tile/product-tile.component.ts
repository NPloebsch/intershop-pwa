import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

import { CategoryView } from 'ish-core/models/category-view/category-view.model';
import {
  ProductView,
  VariationProductMasterView,
  VariationProductView,
} from 'ish-core/models/product-view/product-view.model';
import { ProductHelper } from 'ish-core/models/product/product.model';

export interface ProductTileComponentConfiguration {
  readOnly: boolean;
  displayName: boolean;
  displayVariations: boolean;
  displayPrice: boolean;
  displayPromotions: boolean;
  displayAddToBasket: boolean;
  displayAddToWishlist: boolean;
  displayAddToOrderTemplate: boolean;
  displayAddToCompare: boolean;
  displayAddToQuote: boolean;
}

@Component({
  selector: 'ish-product-tile',
  templateUrl: './product-tile.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductTileComponent {
  @Input() configuration: Partial<ProductTileComponentConfiguration> = {};
  @Input() product: ProductView | VariationProductView | VariationProductMasterView;
  @Input() quantity: number;
  @Input() category: CategoryView;
  @Output() productToBasket = new EventEmitter<number>();

  isMasterProduct = ProductHelper.isMasterProduct;
  isVariationProduct = ProductHelper.isVariationProduct;

  addToBasket() {
    this.productToBasket.emit(this.quantity || this.product.minOrderQuantity);
  }

  get variationCount() {
    return (
      this.product &&
      ProductHelper.isMasterProduct(this.product) &&
      this.product.variations() &&
      this.product.variations().length
    );
  }
}
