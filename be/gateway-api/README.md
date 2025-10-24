# Gateway API - JWT Authentication

## Thiết lập cơ sở dữ liệu

1. Tạo database MySQL với tên `system-db`
2. Chạy script SQL trong file `init-database.sql` để tạo bảng và user demo

## Thông tin đăng nhập demo

### Admin User

- **Username**: admin
- **Password**: admin123
- **Email**: admin@petstore.com
- **Role**: ADMIN

### Regular User

- **Username**: user1
- **Password**: admin123
- **Email**: user1@petstore.com
- **Role**: USER

## Test với Postman

### 1. Đăng ký user mới

**POST** `http://localhost:8080/api/auth/register`

Headers:

```
Content-Type: application/json
```

Body (JSON):

```json
{
  "username": "testuser",
  "password": "password123",
  "email": "test@example.com",
  "fullName": "Test User",
  "phoneNumber": "0123456789"
}
```

### 2. Đăng nhập

**POST** `http://localhost:8080/api/auth/login`

Headers:

```
Content-Type: application/json
```

Body (JSON):

```json
{
  "username": "admin",
  "password": "admin123"
}
```

Response sẽ trả về JWT token:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tokenType": "Bearer",
  "username": "admin",
  "email": "admin@petstore.com",
  "role": "ADMIN"
}
```

### 3. Test endpoint được bảo vệ

**GET** `http://localhost:8080/api/auth/me`

Headers:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

### 4. Test proxy đến các service khác (cần token)

**GET** `http://localhost:8080/api/products/`

Headers:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**GET** `http://localhost:8080/api/orders/`

Headers:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Cấu hình

- **Port**: 8080
- **Database**: MySQL (localhost:3306)
- **Schema**: system-db
- **JWT Secret**: Được cấu hình trong application.yml
- **Token Expiration**: 24 giờ

## Chạy ứng dụng

1. Mở VS Code
2. Mở terminal trong thư mục gateway-api
3. Chạy lệnh: `./mvnw spring-boot:run` (Linux/Mac) hoặc `mvnw.cmd spring-boot:run` (Windows)
4. Hoặc sử dụng Spring Boot Dashboard trong VS Code

## Lưu ý

- Tất cả endpoints `/api/auth/**` không cần authentication
- Các endpoints `/api/products/**` và `/api/orders/**` cần JWT token trong header Authorization
- Token có thời hạn 24 giờ
- CORS đã được cấu hình cho phép tất cả origins
