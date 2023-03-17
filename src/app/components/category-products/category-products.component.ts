import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Params } from '@angular/router';
import { combineLatest, Observable, of, shareReplay } from 'rxjs';
import { map, startWith, switchMap } from 'rxjs/operators';
import { FilterAndSortModel } from 'src/app/models/filter-and-sort.model';
import { ProductModel } from 'src/app/models/product.model';
import { ProductQueryModel } from 'src/app/queries/product.query-model';
import { ProductService } from 'src/app/services/product.service';
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
  readonly filterValues: Observable<string[]> = of([
    'Featured',
    'Price Low to high',
    'Price High to Low',
    'Avg. Rating'
  ]);
  readonly filterAndSortValues$: Observable<FilterAndSortModel[]> = of([
    { id: 1, filterBy: 'featureValue', filterName: 'Featured', sortDirection: 'desc' },
    { id: 2, filterBy: 'price', filterName: 'Price Low to high', sortDirection: 'asc' },
    { id: 3, filterBy: 'price', filterName: 'Price High to Low', sortDirection: 'desc' },
    { id: 4, filterBy: 'ratingValue', filterName: 'Avg. Rating', sortDirection: 'desc' }
  ]);

  readonly products$: Observable<ProductQueryModel[]> = combineLatest([
    this.filterControl.valueChanges.pipe(startWith('Featured')),
    this.productsFromCategory$,
    this.filterAndSortValues$
  ]).pipe(
    map(([filters, products, filterValues]) => {
      if (!filters) {
        return products;
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
      });
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
