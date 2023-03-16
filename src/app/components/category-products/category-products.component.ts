import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { Observable, shareReplay } from 'rxjs';
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

  constructor(private _categoryService: CategoryService) {
  }
}
