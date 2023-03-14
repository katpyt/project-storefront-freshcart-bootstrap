import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { StoreModel } from '../../models/store.model';
import { StoreService } from '../../services/store.service';

@Component({
  selector: 'app-store-products',
  templateUrl: './store-products.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class StoreProductsComponent {
  readonly storeDetails$: Observable<StoreModel> = this._activatedRoute.params.pipe(
    switchMap(data => this._storeService.getOneStore(data['id']))
  );

  constructor(private _activatedRoute: ActivatedRoute, private _storeService: StoreService) {
  }
}
