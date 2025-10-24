export interface OrderItem {
    id: string;
    productId: string;
    productName: string;
    productPrice: number;
    quantity: number;
    subtotal: number;
}

export interface Order {
    id: string;
    userId: string;
    orderNumber: string;
    items: OrderItem[];
    totalItems: number;
    totalPrice: number;
    status: OrderStatus;
    shippingAddress: Address;
    billingAddress?: Address;
    paymentMethod: string;
    paymentStatus: PaymentStatus;
    createdAt: Date;
    updatedAt: Date;
    deliveredAt?: Date;
}

export interface Address {
    fullName: string;
    phoneNumber: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
}

export enum OrderStatus {
    PENDING = 'PENDING',
    CONFIRMED = 'CONFIRMED',
    PROCESSING = 'PROCESSING',
    SHIPPED = 'SHIPPED',
    DELIVERED = 'DELIVERED',
    CANCELLED = 'CANCELLED',
    REFUNDED = 'REFUNDED'
}

export enum PaymentStatus {
    PENDING = 'PENDING',
    PAID = 'PAID',
    FAILED = 'FAILED',
    REFUNDED = 'REFUNDED'
}

export interface CreateOrderRequest {
    shippingAddress: Address;
    billingAddress?: Address;
    paymentMethod: string;
}

export interface OrderResponse {
    success: boolean;
    message?: string;
    order: Order;
}

export interface OrderListResponse {
    content: Order[];
    totalElements: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
}

export interface OrderSearchParams {
    status?: OrderStatus;
    paymentStatus?: PaymentStatus;
    fromDate?: string;
    toDate?: string;
    page?: number;
    size?: number;
    sort?: string;
}
