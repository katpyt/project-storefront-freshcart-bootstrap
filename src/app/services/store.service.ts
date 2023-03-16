import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, switchMap } from 'rxjs';
import { StoreModel } from '../models/store.model';
import { StoreQueryModel } from '../queries/store.query-model';

@Injectable({ providedIn: 'root' })

export class StoreService {
    constructor(private _httpClient: HttpClient) {
    }

    getAllStores(): Observable<StoreQueryModel[]> {
        return this._httpClient.get<StoreModel[]>('https://6384fca14ce192ac60696c4b.mockapi.io/freshcart-stores').pipe(
            map((stores) => {
                return stores.map(store => ({
                    ...store,
                    distanceInKilometers: (Math.round(+store.distanceInMeters) / 1000).toFixed(1) + " km"
                }))
            }
            )
        );

    }

    getOneStore(storeId: string): Observable<StoreModel> {
        return this._httpClient.get<StoreModel>(`https://6384fca14ce192ac60696c4b.mockapi.io/freshcart-stores/${storeId}`).pipe(
            map((store) => {
                return ({
                    ...store,
                    distanceInKilometers: (Math.round(+store.distanceInMeters) / 1000).toFixed(1) + " km"
                })
            })
        );
    }
}
