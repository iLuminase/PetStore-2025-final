import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import {
    CreateOrderRequest,
    Order,
    OrderListResponse,
    OrderResponse,
    OrderSearchParams
} from '../models/order.models';

@Injectable({
    providedIn: 'root'
})
export class OrderService {
    private apiUrl = 'http://localhost:8080/api/orders'; // Via gateway

    private ordersSubject = new BehaviorSubject<Order[]>([]);
    public orders$ = this.ordersSubject.asObservable();

    private currentOrderSubject = new BehaviorSubject<Order | null>(null);
    public currentOrder$ = this.currentOrderSubject.asObservable();

    private loadingSubject = new BehaviorSubject<boolean>(false);
    public loading$ = this.loadingSubject.asObservable();

    constructor(private http: HttpClient) { }

    /**
     * Create a new order from current cart
     */
    createOrder(request: CreateOrderRequest): Observable<OrderResponse> {
        this.loadingSubject.next(true);

        return this.http.post<OrderResponse>(this.apiUrl, request).pipe(
            tap(response => {
                if (response.success && response.order) {
                    this.currentOrderSubject.next(response.order);
                }
                this.loadingSubject.next(false);
            }),
            catchError(error => {
                this.loadingSubject.next(false);
                console.error('Error creating order:', error);
                return throwError(() => error);
            })
        );
    }

    /**
     * Get all orders for current user
     */
    getOrders(params?: OrderSearchParams): Observable<OrderListResponse> {
        this.loadingSubject.next(true);

        let httpParams = new HttpParams();

        if (params) {
            if (params.status) httpParams = httpParams.set('status', params.status);
            if (params.paymentStatus) httpParams = httpParams.set('paymentStatus', params.paymentStatus);
            if (params.fromDate) httpParams = httpParams.set('fromDate', params.fromDate);
            if (params.toDate) httpParams = httpParams.set('toDate', params.toDate);
            if (params.page !== undefined) httpParams = httpParams.set('page', params.page.toString());
            if (params.size !== undefined) httpParams = httpParams.set('size', params.size.toString());
            if (params.sort) httpParams = httpParams.set('sort', params.sort);
        }

        return this.http.get<OrderListResponse>(this.apiUrl, { params: httpParams }).pipe(
            tap(response => {
                this.ordersSubject.next(response.content);
                this.loadingSubject.next(false);
            }),
            catchError(error => {
                this.loadingSubject.next(false);
                console.error('Error fetching orders:', error);
                return throwError(() => error);
            })
        );
    }

    /**
     * Get order by ID
     */
    getOrderById(orderId: string): Observable<Order> {
        this.loadingSubject.next(true);

        return this.http.get<Order>(`${this.apiUrl}/${orderId}`).pipe(
            tap(order => {
                this.currentOrderSubject.next(order);
                this.loadingSubject.next(false);
            }),
            catchError(error => {
                this.loadingSubject.next(false);
                console.error('Error fetching order:', error);
                return throwError(() => error);
            })
        );
    }

    /**
     * Cancel an order
     */
    cancelOrder(orderId: string): Observable<OrderResponse> {
        this.loadingSubject.next(true);

        return this.http.post<OrderResponse>(`${this.apiUrl}/${orderId}/cancel`, {}).pipe(
            tap(response => {
                if (response.success && response.order) {
                    this.currentOrderSubject.next(response.order);
                    // Update in the orders list
                    const orders = this.ordersSubject.value;
                    const updatedOrders = orders.map(o =>
                        o.id === response.order.id ? response.order : o
                    );
                    this.ordersSubject.next(updatedOrders);
                }
                this.loadingSubject.next(false);
            }),
            catchError(error => {
                this.loadingSubject.next(false);
                console.error('Error cancelling order:', error);
                return throwError(() => error);
            })
        );
    }

    /**
     * Track order status
     */
    trackOrder(orderNumber: string): Observable<Order> {
        this.loadingSubject.next(true);

        return this.http.get<Order>(`${this.apiUrl}/track/${orderNumber}`).pipe(
            tap(order => {
                this.currentOrderSubject.next(order);
                this.loadingSubject.next(false);
            }),
            catchError(error => {
                this.loadingSubject.next(false);
                console.error('Error tracking order:', error);
                return throwError(() => error);
            })
        );
    }
}
