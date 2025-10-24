# Product API

REST API cho quản lý sản phẩm trong hệ thống Pet Store.

## Tính năng

- CRUD operations cho sản phẩm (tạo, đọc, cập nhật, xóa mềm)
- Tìm kiếm sản phẩm theo tên, mô tả
- Lọc sản phẩm theo danh mục, thương hiệu, khoảng giá
- Quản lý tồn kho (tăng/giảm số lượng)
- Phân trang và sắp xếp
- Validation dữ liệu đầu vào
- Exception handling toàn cục

## Tech Stack

- Java 21
- Spring Boot 3.5.6
- Spring Data JPA
- MySQL 8
- Maven
- Jakarta Validation

## API Endpoints

### Products

- `GET /api/products` - Lấy danh sách sản phẩm (có phân trang)
- `GET /api/products/{id}` - Lấy sản phẩm theo ID
- `POST /api/products` - Tạo sản phẩm mới
- `PUT /api/products/{id}` - Cập nhật sản phẩm
- `DELETE /api/products/{id}` - Xóa sản phẩm (soft delete)

### Search & Filter

- `GET /api/products/search?query={query}` - Tìm kiếm theo tên/mô tả
- `GET /api/products/category/{category}` - Lọc theo danh mục
- `GET /api/products/brand/{brand}` - Lọc theo thương hiệu
- `GET /api/products/price-range?minPrice={min}&maxPrice={max}` - Lọc theo giá
- `GET /api/products/active` - Lấy các sản phẩm đang hoạt động
- `GET /api/products/available` - Lấy các sản phẩm còn hàng

### Stock Management

- `PUT /api/products/{id}/stock` - Cập nhật số lượng tồn kho
- `PUT /api/products/{id}/stock/increase` - Tăng tồn kho
- `PUT /api/products/{id}/stock/decrease` - Giảm tồn kho
- `GET /api/products/{id}/availability?quantity={qty}` - Kiểm tra tính khả dụng

### Metadata

- `GET /api/products/categories` - Lấy danh sách tất cả danh mục
- `GET /api/products/brands` - Lấy danh sách tất cả thương hiệu
- `GET /api/products/low-stock?threshold={threshold}` - Sản phẩm sắp hết hàng

## Database Schema

```sql
CREATE TABLE products (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    stock_quantity INT NOT NULL,
    category VARCHAR(100),
    brand VARCHAR(50),
    image_url VARCHAR(500),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## Configuration

Cấu hình trong `application.yml`:

```yaml
spring:
  application:
    name: product-api
  datasource:
    url: jdbc:mysql://localhost:3306/petstore_product_db?createDatabaseIfNotExist=true&serverTimezone=UTC
    username: root
    password: root
    driver-class-name: com.mysql.cj.jdbc.Driver
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true

server:
  port: 8081
```

## Chạy ứng dụng

1. Cài đặt MySQL và tạo database:

```sql
CREATE DATABASE petstore_product_db;
```

2. Chạy ứng dụng:

```bash
mvn spring-boot:run
```

3. API sẽ chạy tại: `http://localhost:8081`

## Sample Data

Tạo một số sản phẩm mẫu:

```json
{
  "name": "Royal Canin Dog Food",
  "description": "Premium dry dog food for adult dogs",
  "price": 45.99,
  "stockQuantity": 100,
  "category": "Pet Food",
  "brand": "Royal Canin",
  "imageUrl": "https://example.com/royal-canin.jpg"
}
```

```json
{
  "name": "Cat Scratching Post",
  "description": "Large scratching post for cats",
  "price": 29.99,
  "stockQuantity": 50,
  "category": "Cat Accessories",
  "brand": "PetSafe",
  "imageUrl": "https://example.com/scratching-post.jpg"
}
```

## Testing

Chạy tests:

```bash
mvn test
```

## Health Check

Kiểm tra health của ứng dụng:

- `GET /actuator/health`
- `GET /actuator/info`
