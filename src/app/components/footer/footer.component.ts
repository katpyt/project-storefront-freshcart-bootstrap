import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { combineLatest, map, Observable, of, shareReplay } from 'rxjs';
import helperFunctions from 'src/app/helperFunctions';
import { CategoryModel } from 'src/app/models/category.model';
import { StoreQueryModel } from 'src/app/queries/store.query-model';
import { CategoryService } from 'src/app/services/category.service';
import { StoreService } from 'src/app/services/store.service';
import { TagService } from 'src/app/services/tag.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class FooterComponent {
  readonly categoryList$: Observable<CategoryModel[]> = this._categoryService.getAllCategories().pipe(shareReplay(1));
  readonly aboutUsList$ = of(["Company", "About", "Blog", "Help Center", "Our value"]);

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
        distanceInKilometers: helperFunctions.roundToOneDecimalPlaced(+store.distanceInMeters, 1) + " km",
        tagIds: store.tagIds.map(tagId => tagsMap[+tagId])
      }))
    })
  );

  constructor(private _storeService: StoreService, private _tagService: TagService, private _categoryService: CategoryService) {
  }
}

