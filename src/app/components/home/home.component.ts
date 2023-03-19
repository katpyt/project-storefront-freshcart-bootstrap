import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { combineLatest, map, Observable, of, shareReplay } from 'rxjs';
import { ProductModel } from 'src/app/models/product.model';
import { ProductQueryModel } from 'src/app/queries/product.query-model';
import { StoreQueryModel } from 'src/app/queries/store.query-model';
import { ProductService } from 'src/app/services/product.service';
import { StoreService } from 'src/app/services/store.service';
import { TagService } from 'src/app/services/tag.service';
import { CategoryModel } from '../../models/category.model';
import { CategoryService } from '../../services/category.service';

@Component({
  selector: 'app-home',
  styleUrls: ['./home.component.scss'],
  templateUrl: './home.component.html',
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class HomeComponent {
  readonly categoryList$: Observable<CategoryModel[]> = this._categoryService.getAllCategories().pipe(shareReplay(1));
  readonly productList$: Observable<ProductModel[]> = this._productService.getAllProducts().pipe(shareReplay(1));
  // readonly aboutUsList$ = of(["Company", "About", "Blog", "Help Center", "Our value"]);

  readonly productsFromFirstFeaturedCategoriesList$ = this._getProductsFromFeaturedCategories(this.productList$, "5");

  readonly productsFromSecondFeaturedCategoriesList$ = this._getProductsFromFeaturedCategories(this.productList$, "2");

  readonly storeList$: Observable<StoreQueryModel[]> = combineLatest([
    this._storeService.getAllStores(),
    this._tagService.getAllTags()
  ]).pipe(
    shareReplay(1),
    map(([stores, tags]) => {
      const tagsMap: Record<string, string> = tags.reduce((acc, curr) => {
        return {
          ...acc,
          [+curr.id]: curr.name
        };
      }, {});

      return stores.map(store => ({
        id: store.id,
        name: store.name,
        logoUrl: store.logoUrl.substring(1, store.logoUrl.length),
        distanceInKilometers: store.distanceInKilometers,
        tagIds: store.tagIds.map(tagId => tagsMap[+tagId])
      }))
    })

  );

  showToggle = false;
  onToggle() {
    this.showToggle = !this.showToggle;
  }

  private _getProductsFromFeaturedCategories(productList$: Observable<ProductModel[]>, categoryId: string): Observable<ProductQueryModel[]> {
    return productList$.pipe(
      map((products) => {
        return products.filter(product => product.categoryId === categoryId)
          .sort((a, b) => { return a.featureValue > b.featureValue ? -1 : 1 })
          .slice(0, 5)
          .map((product) => ({
            id: product.id,
            name: product.name,
            fixedPrice: Math.trunc(product.price),
            categoryId: product.categoryId,
            ratingValue: product.ratingValue,
            ratingCount: product.ratingCount,
            ratingStars: [],
            imageUrl: product.imageUrl
          }))
      })
    );
  }

  constructor(private _categoryService: CategoryService, private _storeService: StoreService
    , private _tagService: TagService, private _productService: ProductService) {
  }
}
