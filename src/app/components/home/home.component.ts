import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { combineLatest, from, map, Observable, of, shareReplay, switchMap } from 'rxjs';
import { StoreModel } from 'src/app/models/store.model';
import { StoreQueryModel } from 'src/app/queries/store.query-model';
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
  // readonly storeList$: Observable<StoreModel[]> = this._storeSerive.getAllStores().pipe(shareReplay(1));
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
        distanceInKilometers: this._roundToOneDecimalPlaced(+store.distanceInMeters, 1) + " km",
        tagIds: store.tagIds.map(tagId => tagsMap[+tagId])
      }))
    })

  );

  showToggle = false;
  onToggle() {
    this.showToggle = !this.showToggle;
  }

  private _roundToOneDecimalPlaced(number: number, precision: number) {
    return (Math.round(number) / 1000).toFixed(precision);
  }

  constructor(private _categoryService: CategoryService, private _storeService: StoreService, private _tagService: TagService) {
  }
}
