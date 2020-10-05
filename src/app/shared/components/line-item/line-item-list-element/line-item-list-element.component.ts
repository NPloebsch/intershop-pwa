import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { memoize } from 'lodash-es';
import { Observable } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

import { ProductContextFacade } from 'ish-core/facades/product-context.facade';
import { LineItemUpdate } from 'ish-core/models/line-item-update/line-item-update.model';
import { LineItemView } from 'ish-core/models/line-item/line-item.model';
import { OrderLineItem } from 'ish-core/models/order/order.model';
import { AnyProductViewType, ProductHelper } from 'ish-core/models/product/product.model';
import { SpecialValidators } from 'ish-shared/forms/validators/special-validators';

@Component({
  selector: 'ish-line-item-list-element',
  templateUrl: './line-item-list-element.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ProductContextFacade],
})
export class LineItemListElementComponent implements OnChanges, OnInit {
  @Input() pli: Partial<LineItemView & OrderLineItem>;
  @Input() editable = true;
  @Input() lineItemViewType?: 'simple' | 'availability';

  @Output() updateItem = new EventEmitter<LineItemUpdate>();
  @Output() deleteItem = new EventEmitter<string>();

  product$: Observable<AnyProductViewType>;

  isVariationProduct = ProductHelper.isVariationProduct;
  isBundleProduct = ProductHelper.isProductBundle;

  constructor(private context: ProductContextFacade) {}

  createDummyForm: (pli: Partial<LineItemView>, maxOrderQuantity?: number) => FormGroup = memoize(
    (pli, maxOrderQuantity) => {
      const group = new FormGroup({
        quantity: new FormControl(pli.quantity.value, [
          Validators.required,
          Validators.max(maxOrderQuantity),
          SpecialValidators.integer,
        ]),
      });
      group
        .get('quantity')
        .valueChanges.pipe(debounceTime(800))
        // tslint:disable-next-line: rxjs-prefer-angular-takeuntil
        .subscribe(item => {
          if (group.valid) {
            // TODO: figure out why quantity is returned as string by the valueChanges instead of number (the '+item' fixes that for now) - see ISREST-755
            this.onUpdateItem({
              quantity: +item,
              itemId: pli.id,
            });
          }
        });

      return group;
    },
    pli => pli.id
  );

  ngOnInit() {
    this.product$ = this.context.select('product');
  }

  ngOnChanges() {
    this.context.set('sku', () => this.pli.productSKU);
  }

  onUpdateItem(item: LineItemUpdate) {
    if (item.sku) {
      this.context.set('sku', () => item.sku);
    }
    (this.createDummyForm({ id: item.itemId }).get('quantity') as FormControl).setValue(item.quantity, {
      emitEvent: false,
    });
    this.updateItem.emit(item);
  }

  onDeleteItem(itemId: string) {
    this.deleteItem.emit(itemId);
  }
}
