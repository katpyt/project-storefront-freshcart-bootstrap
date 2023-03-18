import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Params } from '@angular/router';
import { BehaviorSubject, combineLatest, Observable, of, shareReplay } from 'rxjs';
import { map, startWith, switchMap } from 'rxjs/operators';
import { FilterAndSortModel } from '../../models/filter-and-sort.model';
import { ProductModel } from '../../models/product.model';
import { ProductQueryModel } from '../../queries/product.query-model';
import { ProductService } from '../../services/product.service';
import { CategoryModel } from '../../models/category.model';
import { CategoryService } from '../../services/category.service';

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

  onPageSizeChanged(event: Event, page: number) {
    // console.log(event);
    console.log(page);

    this._paginationSubject.next(page);
  }
  onLimitSizeChanged(limit: number) {
    console.log(limit);

    this._limitationSubject.next(limit);
  }

  readonly products$: Observable<ProductQueryModel[]> = combineLatest([
    this.filterControl.valueChanges.pipe(startWith('Featured')),
    this.productsFromCategory$,
    this.filterAndSortValues$,
    this.limitation$,
    this.pagination$
  ]).pipe(
    map(([filters, products, filterValues, limit, page]) => {
      const limitStart = limit * (page - 1);
      const limitEnd = limit * (page - 1) + limit;

      if (!filters) {
        return products.slice(limitStart, limitEnd);
      }

      const filterMap: Record<string, string> = filterValues.reduce(
        (a, b) => {
          return { ...a, [b.filterName]: b.filterBy + '-' + b.sortDirection }
        }, {}
      )

      const filterAndSortCurrentValues = filterMap[filters].split('-');

      return products.sort((a: Record<string, any>, b: Record<string, any>) => {
        if (filterAndSortCurrentValues[1] === 'asc') {
          return a[filterAndSortCurrentValues[0]] > b[filterAndSortCurrentValues[0]] ? 1 : -1
        }
        return a[filterAndSortCurrentValues[0]] > b[filterAndSortCurrentValues[0]] ? -1 : 1
      }).slice(limitStart, limitEnd);
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

  constructor(private _categoryService: CategoryService, private _productService: ProductService, private _activatedRoute: ActivatedRoute) {
  }
}
