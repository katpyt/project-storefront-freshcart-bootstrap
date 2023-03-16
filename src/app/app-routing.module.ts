import { NgModule } from '@angular/core';
import { RouterModule, Routes, } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { CategoryProductsComponent } from './components/category-products/category-products.component';
import { StoreProductsComponent } from './components/store-products/store-products.component';
import { HomeComponentModule } from './components/home/home.component-module';
import { CategoryProductsComponentModule } from './components/category-products/category-products.component-module';
import { StoreProductsComponentModule } from './components/store-products/store-products.component-module';
import { HeaderComponentModule } from './components/header/header.component-module';
import { FooterComponentModule } from './components/footer/footer.component-module';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'categories/:categoryId', component: CategoryProductsComponent },
  { path: 'stores/:storeId', component: StoreProductsComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes), HeaderComponentModule, FooterComponentModule, HomeComponentModule, CategoryProductsComponentModule, StoreProductsComponentModule],
  exports: [RouterModule, HeaderComponentModule, FooterComponentModule],
})
export class AppRoutingModule { }
