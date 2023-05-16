import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StoreProductsComponent } from './store-products.component';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  imports: [RouterModule, CommonModule, ReactiveFormsModule],
  declarations: [StoreProductsComponent],
  providers: [],
  exports: [StoreProductsComponent]
})
export class StoreProductsComponentModule {
}
