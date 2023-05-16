import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { combineLatest, Observable } from 'rxjs';
import { map, shareReplay, startWith, switchMap } from 'rxjs/operators';
import { StoreQueryModel } from '../../queries/store.query-model';
import { ProductModel } from '../../models/product.model';
import { StoreService } from '../../services/store.service';
import { ProductService } from '../../services/product.service';
import { CategoryModel } from 'src/app/models/category.model';
import { CategoryService } from 'src/app/services/category.service';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-store-products',
  templateUrl: './store-products.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class StoreProductsComponent {
  readonly categoryList$: Observable<CategoryModel[]> = this._categoryService.getAllCategories().pipe(shareReplay(1));

  readonly searchStore = new FormControl('');
  readonly filterSearchStore$ = this.searchStore.valueChanges.pipe(startWith(''));

  readonly storeDetails$: Observable<StoreQueryModel> = this._activatedRoute.params.pipe(
    switchMap(data => this._storeService.getOneStore(data['storeId']))
  ).pipe(
    map((store) => {
      return {
        id: store.id,
        name: store.name,
        logoUrl: store.logoUrl.substring(1, store.logoUrl.length),
        distanceInKilometers: store.distanceInKilometers,
        tagIds: store.tagIds
      }
    }),
    shareReplay(1)
  );

  readonly storeProducts$: Observable<ProductModel[]> = combineLatest([
    this._productService.getAllProducts(),
    this._activatedRoute.params,
    this.filterSearchStore$
  ])
    .pipe(
      map(([products, params, filterSearchStore]) => {
        return products
          .filter(product => product.storeIds.includes(params['storeId']))
          .filter(product => product.name.toLocaleLowerCase().includes(filterSearchStore.toLowerCase()))
      })
    );

  constructor(private _activatedRoute: ActivatedRoute, private _storeService: StoreService
    , private _productService: ProductService, private _categoryService: CategoryService) {
  }
}
