import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { ProductModel } from '../models/product.model';

@Injectable({ providedIn: 'root' })

export class ProductService {
    constructor(private _httpClient: HttpClient) {
    }

    getAllProducts(): Observable<ProductModel[]> {
        return this._httpClient.get<ProductModel[]>('https://6384fca14ce192ac60696c4b.mockapi.io/freshcart-products');
    }

    getAllProductsForCategory(categoryId: string): Observable<ProductModel[]> {
        return this._httpClient.get<ProductModel[]>('https://6384fca14ce192ac60696c4b.mockapi.io/freshcart-products')
            .pipe(
                map((products) => {
                    return products.filter(product => product.categoryId === categoryId)
                })
            );
    }
}
