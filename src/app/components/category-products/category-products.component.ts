import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { combineLatest, Observable, shareReplay } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
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

  readonly categoryName$ = combineLatest([
    this.categories$,
    this.params$
  ]).pipe(
    map(([categories, params]) => categories.filter(cat => cat.id === params['categoryId']).map(c => c.name)
    ));

  readonly products$: Observable<ProductQueryModel[]> = this.params$.pipe(
    switchMap(data => this._productService.getAllProductsforCategory(data['categoryId']))
  ).pipe(
    map((products) => products.map((product) => {

      return {
        id: product.id,
        name: product.name,
        fixedPriceWithCurrency: product.price,
        categoryId: product.categoryId,
        ratingValue: product.ratingValue,
        ratingCount: product.ratingCount,
        ratingStars: this._getStarsValues(product.ratingValue),
        imageUrl: product.imageUrl
      }
    }))
  );

  private _getStarsValues(ratingValues: number) {
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
