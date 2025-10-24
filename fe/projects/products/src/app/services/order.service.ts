import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class OrderService {
    private apiUrl = 'your-api-endpoint/orders'; // Replace with actual API URL

    constructor(private http: HttpClient) { }

    addToCart(item: { productId: number; quantity: number }): Observable<any> {
        return this.http.post(`${this.apiUrl}/cart`, item);
    }
}
