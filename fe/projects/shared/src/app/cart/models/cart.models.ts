export interface CartItem {
    id: number;
    productId: number;
    userId: number;
    quantity: number;
    price: number;
    subtotal: number;
    createdAt: Date;
    updatedAt: Date;
    productName?: string;
    productImage?: string;
    productImageUrl?: string;
    productPrice?: number;
    productCategory?: string;
    productAvailable?: boolean;
}

export interface Cart {
    userId: number;
    items: CartItem[];
    totalItems: number;
    totalQuantity: number;
    totalAmount: number;
    totalPrice: number;
    subtotal: number;
    tax: number;
    shipping: number;
    id?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface AddToCartRequest {
    productId: number;
    quantity: number;
    price: number;
    productName?: string;
    productImage?: string;
}

export interface UpdateCartItemRequest {
    quantity: number;
}

export interface CartResponse {
    success: boolean;
    message?: string;
    cart: Cart;
}
