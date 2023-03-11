import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { Observable, of, shareReplay } from 'rxjs';
import { StoreModel } from 'src/app/models/store.model';
import { StoreService } from 'src/app/services/store.service';
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
  readonly storeList$: Observable<StoreModel[]> = this._storeSerive.getAllStores().pipe(shareReplay(1));
  readonly aboutUsList$ = of(["Company", "About", "Blog", "Help Center", "Our value"]);

  showToggle = false;
  onToggle() {
    this.showToggle = !this.showToggle;
  }

  constructor(private _categoryService: CategoryService, private _storeSerive: StoreService) {
  }
}
