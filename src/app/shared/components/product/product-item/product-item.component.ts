import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { Observable, ReplaySubject, Subject } from 'rxjs';
import { filter, startWith, take, takeUntil } from 'rxjs/operators';

import { ProductContextFacade } from 'ish-core/facades/product-context.facade';
import { ShoppingFacade } from 'ish-core/facades/shopping.facade';
import { Category } from 'ish-core/models/category/category.model';
import { ProductVariationHelper } from 'ish-core/models/product-variation/product-variation.helper';
import { VariationOptionGroup } from 'ish-core/models/product-variation/variation-option-group.model';
import { VariationSelection } from 'ish-core/models/product-variation/variation-selection.model';
import { ProductView, VariationProductView } from 'ish-core/models/product-view/product-view.model';
import { ProductHelper } from 'ish-core/models/product/product.model';
import { ProductRowComponentConfiguration } from 'ish-shared/components/product/product-row/product-row.component';
import { ProductTileComponentConfiguration } from 'ish-shared/components/product/product-tile/product-tile.component';

export type ProductItemContainerConfiguration = ProductTileComponentConfiguration &
  ProductRowComponentConfiguration & { displayType: 'tile' | 'row' };

export const DEFAULT_CONFIGURATION: Readonly<ProductItemContainerConfiguration> = {
  readOnly: false,
  allowZeroQuantity: false,
  quantityLabel: ' ',
  displayName: true,
  displayDescription: true,
  displaySKU: true,
  displayInventory: true,
  displayQuantity: true,
  displayPrice: true,
  displayPromotions: true,
  displayVariations: true,
  displayShipment: false,
  displayAddToBasket: true,
  displayAddToWishlist: true,
  displayAddToOrderTemplate: true,
  displayAddToCompare: true,
  displayAddToQuote: true,
  displayType: 'tile',
};

/**
 * The Product Item Container Component fetches the product data for a given product sku
 * and renders the product either as 'tile' or 'row'.
 * The 'tile' rendering is the default if no value is provided for the displayType.
 *
 * @example
 * <ish-product-item [productSku]="product.sku"></ish-product-item>
 */
@Component({
  selector: 'ish-product-item',
  templateUrl: './product-item.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ProductContextFacade],
})
export class ProductItemComponent implements OnInit, OnChanges, OnDestroy {
  /**
   * The Product SKU to render a product item for.
   */
  @Input() productSku: string;
  @Output() productSkuChange = new EventEmitter<string>();
  /**
   * The quantity which should be set for this. Default is minOrderQuantity.
   */
  @Input() quantity: number;
  @Output() quantityChange = new EventEmitter<number>();
  /**
   * The optional Category context.
   */
  @Input() category?: Category;
  /**
   * configuration
   */
  @Input() configuration: ProductItemContainerConfiguration = DEFAULT_CONFIGURATION;

  product$: Observable<ProductView>;
  loading$: Observable<boolean>;
  productVariationOptions$: Observable<VariationOptionGroup[]>;
  isInCompareList$: Observable<boolean>;

  private sku$ = new ReplaySubject<string>(1);
  private destroy$ = new Subject();

  constructor(private shoppingFacade: ShoppingFacade, private context: ProductContextFacade) {}

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnInit() {
    this.product$ = this.context.select('product');
    this.loading$ = this.context.select('loading');

    this.productSkuChange.pipe(startWith(this.productSku), takeUntil(this.destroy$)).subscribe(this.sku$);

    this.productVariationOptions$ = this.shoppingFacade.productVariationOptions$(this.sku$);

    this.isInCompareList$ = this.shoppingFacade.inCompareProducts$(this.sku$);
  }

  ngOnChanges(changes: SimpleChanges) {
    this.mergeConfiguration(changes);

    this.context.set('sku', () => this.productSku);
  }

  private mergeConfiguration(changes: SimpleChanges) {
    if (changes.configuration && changes.configuration.firstChange) {
      const oldConfig = this.configuration || {};
      // tslint:disable-next-line:no-assignement-to-inputs
      this.configuration = { ...DEFAULT_CONFIGURATION, ...oldConfig };
    }
  }

  toggleCompare() {
    this.sku$.pipe(take(1), takeUntil(this.destroy$)).subscribe(sku => this.shoppingFacade.toggleProductCompare(sku));
  }

  addToBasket(quantity: number) {
    this.context.addToBasket(quantity);
  }

  replaceVariation(event: { selection: VariationSelection; changedAttribute?: string }) {
    this.product$
      .pipe(
        take(1),
        filter<VariationProductView>(product => ProductHelper.isVariationProduct(product)),
        takeUntil(this.destroy$)
      )
      .subscribe(product => {
        const { sku } = ProductVariationHelper.findPossibleVariationForSelection(
          event.selection,
          product,
          event.changedAttribute
        );
        this.productSkuChange.emit(sku);
      });
  }

  get isTile() {
    return !!this.configuration && this.configuration.displayType === 'tile';
  }

  get isRow() {
    return !this.isTile;
  }
}
