import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import {
    AddToCartRequest,
    Cart,
    UpdateCartItemRequest
} from '../models/cart.models';

@Injectable({
    providedIn: 'root'
})
export class CartService {
    private apiUrl = 'http://localhost:8080/api/carts'; // Via gateway

    private cartSubject = new BehaviorSubject<Cart | null>(null);
    public cart$ = this.cartSubject.asObservable();

    private loadingSubject = new BehaviorSubject<boolean>(false);
    public loading$ = this.loadingSubject.asObservable();

    constructor(private http: HttpClient) { }

    /**
     * Get current user's cart
     */
    getCart(): Observable<Cart> {
        this.loadingSubject.next(true);

        return this.http.get<any>(this.apiUrl).pipe(
            tap(response => {
                // Convert backend response to frontend Cart model
                const cart = this.convertToCart(response);
                this.cartSubject.next(cart);
                this.loadingSubject.next(false);
            }),
            catchError(error => {
                this.loadingSubject.next(false);
                console.error('Error fetching cart:', error);
                return throwError(() => error);
            })
        );
    }

    /**
     * Add item to cart
     */
    addToCart(request: AddToCartRequest): Observable<any> {
        this.loadingSubject.next(true);

        return this.http.post<any>(`${this.apiUrl}/add`, request).pipe(
            tap(response => {
                this.loadingSubject.next(false);
                // Reload cart after adding
                this.getCart().subscribe();
            }),
            catchError(error => {
                this.loadingSubject.next(false);
                console.error('Error adding to cart:', error);
                return throwError(() => error);
            })
        );
    }

    /**
     * Update cart item quantity
     */
    updateCartItem(productId: string, request: UpdateCartItemRequest): Observable<any> {
        this.loadingSubject.next(true);

        return this.http.put<any>(`${this.apiUrl}/product/${productId}`, request).pipe(
            tap(response => {
                this.loadingSubject.next(false);
                // Reload cart to get updated data
                this.getCart().subscribe();
            }),
            catchError(error => {
                this.loadingSubject.next(false);
                console.error('Error updating cart item:', error);
                return throwError(() => error);
            })
        );
    }

    /**
     * Remove item from cart
     */
    removeFromCart(productId: string): Observable<any> {
        this.loadingSubject.next(true);

        return this.http.delete<any>(`${this.apiUrl}/product/${productId}`).pipe(
            tap(response => {
                this.loadingSubject.next(false);
                // Reload cart to get updated data
                this.getCart().subscribe();
            }),
            catchError(error => {
                this.loadingSubject.next(false);
                console.error('Error removing from cart:', error);
                return throwError(() => error);
            })
        );
    }

    /**
     * Clear entire cart
     */
    clearCart(): Observable<void> {
        this.loadingSubject.next(true);

        return this.http.delete<void>(`${this.apiUrl}/clear`).pipe(
            tap(() => {
                this.cartSubject.next(null);
                this.loadingSubject.next(false);
            }),
            catchError(error => {
                this.loadingSubject.next(false);
                console.error('Error clearing cart:', error);
                return throwError(() => error);
            })
        );
    }

    /**
     * Convert backend response to frontend Cart model
     */
    private convertToCart(response: any): Cart {
        return {
            userId: response.userId,
            items: response.items.map((item: any) => ({
                id: item.id,
                productId: item.productId,
                userId: item.userId,
                quantity: item.quantity,
                price: item.price,
                subtotal: item.subtotal,
                createdAt: item.createdAt,
                updatedAt: item.updatedAt,
                productName: item.productName,
                productImage: item.productImage,
                productImageUrl: item.productImage,
                productPrice: item.price,
                productCategory: item.productCategory,
                productAvailable: item.productAvailable
            })),
            totalItems: response.totalItems || 0,
            totalQuantity: response.totalQuantity || 0,
            totalAmount: response.totalAmount || 0,
            totalPrice: response.totalAmount || 0,
            subtotal: response.subtotal || 0,
            tax: response.tax || 0,
            shipping: response.shipping || 0
        };
    }

    /**
     * Get cart item count
     */
    getCartItemCount(): number {
        const cart = this.cartSubject.value;
        return cart ? cart.totalItems : 0;
    }

    /**
     * Get cart total price
     */
    getCartTotalPrice(): number {
        const cart = this.cartSubject.value;
        return cart ? cart.totalPrice : 0;
    }
}
