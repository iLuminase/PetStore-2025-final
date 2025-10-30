import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import {
    Product,
    ProductCreateRequest,
    ProductResponse,
    ProductSearchParams,
    ProductUpdateRequest
} from '../models/product.models';

@Injectable({
    providedIn: 'root'
})
export class ProductService {
    private apiUrl = 'http://localhost:8080/api/products'; // Via gateway

    private productsSubject = new BehaviorSubject<Product[]>([]);
    public products$ = this.productsSubject.asObservable();

    private loadingSubject = new BehaviorSubject<boolean>(false);
    public loading$ = this.loadingSubject.asObservable();

    constructor(private http: HttpClient) { }

    /**
     * Get all products with pagination and search
     */
    getProducts(params?: ProductSearchParams): Observable<ProductResponse> {
        this.loadingSubject.next(true);

        let httpParams = new HttpParams();

        if (params) {
            if (params.name) httpParams = httpParams.set('name', params.name);
            if (params.category) httpParams = httpParams.set('category', params.category);
            if (params.minPrice !== undefined) httpParams = httpParams.set('minPrice', params.minPrice.toString());
            if (params.maxPrice !== undefined) httpParams = httpParams.set('maxPrice', params.maxPrice.toString());
            if (params.page !== undefined) httpParams = httpParams.set('page', params.page.toString());
            if (params.size !== undefined) httpParams = httpParams.set('size', params.size.toString());
            if (params.sort) httpParams = httpParams.set('sort', params.sort);
        }

        return this.http.get<ProductResponse>(this.apiUrl, { params: httpParams })
            .pipe(
                tap(response => {
                    this.productsSubject.next(response.content);
                    this.loadingSubject.next(false);
                })
            );
    }

    /**
     * Get a single product by ID
     */
    getProductById(id: number): Observable<Product> {
        return this.http.get<Product>(`${this.apiUrl}/${id}`);
    }

    /**
     * Create a new product
     */
    createProduct(product: ProductCreateRequest): Observable<Product> {
        return this.http.post<Product>(this.apiUrl, product)
            .pipe(
                tap(() => {
                    // Refresh the products list
                    this.refreshProducts();
                })
            );
    }

    /**
     * Update an existing product
     */
    updateProduct(product: ProductUpdateRequest): Observable<Product> {
        return this.http.put<Product>(`${this.apiUrl}/${product.id}`, product)
            .pipe(
                tap(() => {
                    // Refresh the products list
                    this.refreshProducts();
                })
            );
    }

    /**
     * Delete a product
     */
    deleteProduct(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`)
            .pipe(
                tap(() => {
                    // Refresh the products list
                    this.refreshProducts();
                })
            );
    }

    /**
     * Search products by name
     */
    searchProducts(searchTerm: string): Observable<Product[]> {
        const params = new HttpParams().set('name', searchTerm);
        return this.http.get<Product[]>(`${this.apiUrl}/search`, { params });
    }

    /**
     * Get products by category
     */
    getProductsByCategory(category: string): Observable<Product[]> {
        const params = new HttpParams().set('category', category);
        return this.http.get<Product[]>(`${this.apiUrl}/category`, { params });
    }

    /**
     * Get all categories
     */
    getCategories(): Observable<string[]> {
        return this.http.get<string[]>(`${this.apiUrl}/categories`);
    }

    /**
     * Refresh the products list
     */
    private refreshProducts(): void {
        this.getProducts().subscribe();
    }

    /**
     * Clear the products cache
     */
    clearCache(): void {
        this.productsSubject.next([]);
    }
}