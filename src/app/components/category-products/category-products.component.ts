import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Params } from '@angular/router';
import { BehaviorSubject, Observable, combineLatest, of, shareReplay } from 'rxjs';
import { map, startWith, switchMap, tap } from 'rxjs/operators';
import { CategoryModel } from '../../models/category.model';
import { ProductModel } from '../../models/product.model';
import { FilterAndSortModel } from '../../models/filter-and-sort.model';
import { StoreQueryModel } from '../../queries/store.query-model';
import { ProductQueryModel } from '../../queries/product.query-model';
import { CategoryService } from '../../services/category.service';
import { ProductService } from '../../services/product.service';
import { StoreService } from '../../services/store.service';
import { TokenizeResult } from '@angular/compiler/src/ml_parser/lexer';

@Component({
  selector: 'app-category-products',
  templateUrl: './category-products.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class CategoryProductsComponent {
  readonly categories$: Observable<CategoryModel[]> = this._categoryService.getAllCategories().pipe(shareReplay(1));
  readonly params$: Observable<Params> = this._activatedRoute.params;
  readonly productsFromCategory$: Observable<ProductModel[]> = this.params$.pipe(
    switchMap(params => this._productService.getAllProductsForCategory(params['categoryId']))
  );
  readonly stores$: Observable<StoreQueryModel[]> = this._storeService.getAllStores().pipe(
    tap((stores) => {
      stores.forEach((store) => {
        this.storeFiltersForm.addControl(store.id, new FormControl(false))
      })
    })
  );

  readonly categoryName$ = combineLatest([
    this.categories$,
    this.params$
  ]).pipe(
    map(([categories, params]) => categories.filter(cat => cat.id === params['categoryId']).map(c => c.name))
  );

  readonly filterControl: FormControl = new FormControl('Featured');
  readonly filterValues: Observable<string[]> = of(['Featured', 'Price Low to high', 'Price High to Low', 'Avg. Rating']);
  readonly filterAndSortValues$: Observable<FilterAndSortModel[]> = of([
    { id: 1, filterBy: 'featureValue', filterName: 'Featured', sortDirection: 'desc' },
    { id: 2, filterBy: 'price', filterName: 'Price Low to high', sortDirection: 'asc' },
    { id: 3, filterBy: 'price', filterName: 'Price High to Low', sortDirection: 'desc' },
    { id: 4, filterBy: 'ratingValue', filterName: 'Avg. Rating', sortDirection: 'desc' }
  ]);

  readonly storeFiltersForm: FormGroup = new FormGroup({});
  //selectedStores: FormArray = new FormArray([]);
  selectedStores: FormArray = new FormArray([]);
  readonly filterStoreValues$ = this.storeFiltersForm.valueChanges.pipe(startWith(''));

  readonly priceFiltersForm: FormGroup = new FormGroup({
    priceFrom: new FormControl(''),
    priceTo: new FormControl('')
  });
  readonly filterPriceValues$ = this.priceFiltersForm.valueChanges.pipe(startWith({ priceFrom: '', priceTo: '' }));

  readonly ratingStartValuesForFilter$: Observable<number[]> = of([5, 4, 3, 2]);
  readonly ratingValuesForFilter$: Observable<string[][]> = this.ratingStartValuesForFilter$.pipe(
    map(items => items.map(item => this._getStarsValues(item)))
  );
  readonly ratingForm: FormControl = new FormControl('');
  readonly filterRatingValues$ = this.ratingForm.valueChanges.pipe(startWith(''));

  readonly limits$: Observable<number[]> = of([5, 10, 15]);
  readonly pages$: Observable<number[]> = of([1, 2, 3]);

  readonly initialLimitValue: number = 5;
  readonly initialPageValue: number = 1;

  private _limitationSubject: BehaviorSubject<number> = new BehaviorSubject<number>(this.initialLimitValue);
  public limitation$: Observable<number> = this._limitationSubject
    .asObservable()
    .pipe(shareReplay(1));

  private _paginationSubject: BehaviorSubject<number> = new BehaviorSubject<number>(this.initialPageValue);
  public pagination$: Observable<number> = this._paginationSubject
    .asObservable()
    .pipe(shareReplay(1));

  onPageSizeChanged(page: number) {
    this._paginationSubject.next(page);
  }
  onLimitSizeChanged(limit: number) {
    this._limitationSubject.next(limit);
  }

  onSelected(event: Event | null) {
    // console.log(event);
    const input = event?.target as HTMLInputElement;
    // console.log("id [" + input.value + ", checked [" + input.checked + "]");
    // const idFormArray = <FormArray>this.storeFiltersForm.controls.;

    if (input.checked) {
      this.selectedStores.push(new FormControl(input.value));
    }
    else {
      const index = this.selectedStores.controls.findIndex(storeId => storeId.value === input.value);
      this.selectedStores.removeAt(index);
    }
  }

  readonly products$: Observable<ProductQueryModel[]> = combineLatest([
    this.filterControl.valueChanges.pipe(startWith('Featured')),
    this.productsFromCategory$,
    this.filterAndSortValues$,
    this.limitation$,
    this.pagination$,
    this.filterPriceValues$,
    this.filterRatingValues$,
    this.filterStoreValues$
  ]).pipe(
    map(([filters, products, filterValues, limit, page, filterPriceValues, filterRatingValues, filterStoreValues]) => {

      console.log(filterStoreValues);

      // const storeValueFromFilter = filterStoreValues.reduce(
      //   (acc, curr) => {
      //     return { acc, curr === true ? curr : ''), ''
      // )

      const limitStart: number = limit * (page - 1);
      const limitEnd: number = limit * (page - 1) + limit;

      const ratingValueFromFilter: number = String(filterRatingValues).split(',')
        .reduce((acc: number, curr: string) => (curr === '-fill' ? acc + 1 : acc), 0);

      if (!filters) {
        return products.slice(limitStart, limitEnd);
      }

      const filterMap: Record<string, string> = filterValues.reduce(
        (a, b) => {
          return { ...a, [b.filterName]: b.filterBy + '-' + b.sortDirection }
        }, {}
      )

      const filterAndSortCurrentValues: string[] = filterMap[filters].split('-');

      return products
        .sort((a: Record<string, any>, b: Record<string, any>) => {
          if (filterAndSortCurrentValues[1] === 'asc') {
            return a[filterAndSortCurrentValues[0]] > b[filterAndSortCurrentValues[0]] ? 1 : -1
          }
          return a[filterAndSortCurrentValues[0]] > b[filterAndSortCurrentValues[0]] ? -1 : 1
        })
        .filter((product) => {
          return filterPriceValues.priceFrom ? product.price >= +filterPriceValues.priceFrom : true
        })
        .filter((product) => {
          return filterPriceValues.priceTo ? product.price <= +filterPriceValues.priceTo : true
        })
        .filter((product) => {
          return ratingValueFromFilter ? Math.floor(product.ratingValue) === ratingValueFromFilter : true
        })
        // .filter((product) => {
        //   return filterStoreValues ? filterStoreValues[product..storeId] === true : true
        // })
        .slice(limitStart, limitEnd);
    })
  ).pipe(
    map((products) => products.map(product => ({
      id: product.id,
      name: product.name,
      fixedPriceWithCurrency: product.price,
      categoryId: product.categoryId,
      ratingValue: product.ratingValue,
      ratingCount: product.ratingCount,
      ratingStars: this._getStarsValues(product.ratingValue),
      imageUrl: product.imageUrl
    })))
  );

  private _getStarsValues(ratingValues: number): string[] {
    return [0, 0, 0, 0, 0].map((_, i) => {
      if (ratingValues >= i + 1) {
        return '-fill';
      }
      if (ratingValues < i + 1 && ratingValues > i) {
        return '-half';
      }
      return '';
    });
  }

  constructor(private _categoryService: CategoryService, private _productService: ProductService
    , private _storeService: StoreService, private _activatedRoute: ActivatedRoute) {
  }

}
