import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { Observable, shareReplay } from 'rxjs';
import { CategoryModel } from 'src/app/models/category.model';
import { CategoryService } from 'src/app/services/category.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent {

  readonly categoryList$: Observable<CategoryModel[]> = this._categoryService.getAllCategories().pipe(shareReplay(1));

  showToggle = false;
  onToggle() {
    this.showToggle = !this.showToggle;
  }

  constructor(private _categoryService: CategoryService) {
  }
}
