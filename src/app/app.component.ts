import { Component } from '@angular/core';
import { combineLatest, map, Observable, of, shareReplay } from 'rxjs';
import { CategoryModel } from './models/category.model';
import { StoreQueryModel } from './queries/store.query-model';
import { CategoryService } from './services/category.service';
import { StoreService } from './services/store.service';
import { TagService } from './services/tag.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})

export class AppComponent {

  title = 'ng-freshcard-bootstrap-theme';

  readonly aboutUsList$ = of(["Company", "About", "Blog", "Help Center", "Our value"]);

  readonly categoryList$: Observable<CategoryModel[]> = this._categoryService.getAllCategories().pipe(shareReplay(1));

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

  constructor(private _storeService: StoreService, private _tagService: TagService, private _categoryService: CategoryService) {
  }
}
