import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { UUID } from 'angular2-uuid';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { ProductContextFacade } from 'ish-core/facades/product-context.facade';
import { ProductVariationHelper } from 'ish-core/models/product-variation/product-variation.helper';
import { VariationOptionGroup } from 'ish-core/models/product-variation/variation-option-group.model';

@Component({
  selector: 'ish-product-variation-select',
  templateUrl: './product-variation-select.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductVariationSelectComponent implements OnInit {
  uuid = UUID.UUID();
  variationOptions$: Observable<VariationOptionGroup[]>;

  constructor(private context: ProductContextFacade) {}

  ngOnInit() {
    this.variationOptions$ = this.context
      .select('productAsVariationProduct')
      .pipe(map(ProductVariationHelper.buildVariationOptionGroups));
  }

  optionChange(group: string, value: string) {
    this.context.changeVariationOption(group, value);
  }
}
