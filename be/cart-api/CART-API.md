# Cart API Documentation

## Base URL: `/api/cart`

### Authentication Required

All endpoints require JWT token in Authorization header: `Bearer <token>`

## Cart Management Endpoints

### 1. Get Cart

**GET** `/api/cart`

- **Description**: Get user's complete cart with all items
- **Response**: `CartSummaryResponse` with items, totals, quantities

### 2. Add to Cart

**POST** `/api/cart/add`

- **Description**: Add product to cart (or update quantity if exists)
- **Body**:

```json
{
  "productId": 1,
  "quantity": 2,
  "price": 29.99,
  "productName": "Pet Toy",
  "productImage": "toy.jpg"
}
```

### 3. Update Cart Item

**PUT** `/api/cart/product/{productId}`

- **Description**: Update specific item quantity
- **Body**:

```json
{
  "quantity": 5
}
```

### 4. Remove from Cart

**DELETE** `/api/cart/product/{productId}`

- **Description**: Remove specific product from cart

### 5. Clear Cart

**DELETE** `/api/cart/clear`

- **Description**: Remove all items from cart

## Item Operations

### 6. Get Cart Item

**GET** `/api/cart/product/{productId}`

- **Description**: Get specific cart item details

### 7. Check if Product in Cart

**GET** `/api/cart/product/{productId}/exists`

- **Response**: `{"exists": true/false}`

### 8. Increase Quantity

**PUT** `/api/cart/product/{productId}/increase`

- **Description**: Increase item quantity by 1 (or specified amount)
- **Body** (optional):

```json
{
  "quantity": 2
}
```

### 9. Decrease Quantity

**PUT** `/api/cart/product/{productId}/decrease`

- **Description**: Decrease item quantity by 1 (or specified amount)
- **Note**: Removes item if quantity becomes 0

## Cart Summary Endpoints

### 10. Get Cart Count

**GET** `/api/cart/count`

- **Response**: `{"count": 5}` (total quantity)

### 11. Get Cart Total

**GET** `/api/cart/total`

- **Response**: `{"total": 149.95}` (total amount)

## Bulk Operations

### 12. Add Multiple Items

**POST** `/api/cart/add-multiple`

- **Description**: Add multiple products at once
- **Body**: Array of `AddToCartRequest`

### 13. Remove Multiple Items

**DELETE** `/api/cart/remove-multiple`

- **Description**: Remove multiple products at once
- **Body**: `[1, 2, 3]` (array of product IDs)

## Example Usage Flow

```javascript
// 1. Add product to cart
POST /api/cart/add
{
    "productId": 1,
    "quantity": 2,
    "price": 29.99
}

// 2. Update quantity
PUT /api/cart/product/1
{
    "quantity": 5
}

// 3. Increase by 1
PUT /api/cart/product/1/increase

// 4. Check cart
GET /api/cart

// 5. Remove item
DELETE /api/cart/product/1
```

## Response Examples

### CartItemResponse

```json
{
  "id": 1,
  "productId": 123,
  "userId": 456,
  "quantity": 2,
  "price": 29.99,
  "subtotal": 59.98,
  "createdAt": "2025-10-23T15:30:00",
  "updatedAt": "2025-10-23T15:35:00"
}
```

### CartSummaryResponse

```json
{
    "userId": 456,
    "items": [...],
    "totalItems": 3,
    "totalQuantity": 7,
    "subtotal": 149.95,
    "tax": 0.00,
    "shipping": 0.00,
    "totalAmount": 149.95
}
```
