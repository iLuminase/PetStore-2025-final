export interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    stockQuantity: number;
    category: string;
    imageUrl?: string;
    brand?: string;
    weight?: number;
    dimensions?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface ProductCreateRequest {
    name: string;
    description: string;
    price: number;
    stockQuantity: number;
    category: string;
    imageUrl?: string;
    brand?: string;
    weight?: number;
    dimensions?: string;
}

export interface ProductUpdateRequest extends Partial<ProductCreateRequest> {
    id: number;
}

export interface ProductSearchParams {
    name?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    page?: number;
    size?: number;
    sort?: string;
}

export interface ProductResponse {
    content: Product[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
    first: boolean;
    last: boolean;
}