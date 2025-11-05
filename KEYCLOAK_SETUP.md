# Hướng dẫn cấu hình Keycloak cho PetStore

## 1. Cài đặt và khởi động Keycloak

### Sử dụng Docker (Khuyến nghị)
```bash
docker run -d \
  --name keycloak \
  -p 9090:8080 \
  -e KEYCLOAK_ADMIN=admin \
  -e KEYCLOAK_ADMIN_PASSWORD=admin \
  quay.io/keycloak/keycloak:latest \
  start-dev
```

### Hoặc tải về và chạy trực tiếp
1. Tải Keycloak từ: https://www.keycloak.org/downloads
2. Giải nén và chạy:
```bash
cd keycloak-<version>
bin/kc.sh start-dev --http-port=9090
```

## 2. Truy cập Keycloak Admin Console

- URL: http://localhost:9090/auth/admin
- Username: `admin`
- Password: `admin`

## 3. Tạo Realm

1. Click vào dropdown "Master" ở góc trên bên trái
2. Click "Create Realm"
3. Nhập tên: `pet-realm`
4. Click "Create"

## 4. Tạo Client

1. Trong realm `pet-realm`, vào menu "Clients"
2. Click "Create client"
3. Cấu hình:
   - **Client ID**: `pet-client`
   - **Client Protocol**: `openid-connect`
   - Click "Next"

4. Capability config:
   - **Client authentication**: OFF (public client)
   - **Authorization**: OFF
   - **Authentication flow**: 
     - ✅ Standard flow
     - ✅ Direct access grants
   - Click "Next"

5. Login settings:
   - **Root URL**: `http://localhost:4200`
   - **Home URL**: `http://localhost:4200`
   - **Valid redirect URIs**: 
     - `http://localhost:4200/*`
     - `http://localhost:4201/*`
   - **Valid post logout redirect URIs**: 
     - `http://localhost:4200/*`
   - **Web origins**: 
     - `http://localhost:4200`
     - `http://localhost:4201`
   - Click "Save"

## 5. Cấu hình Client (Advanced)

1. Vào tab "Advanced"
2. Tìm "Advanced Settings":
   - **Access Token Lifespan**: 5 Minutes (hoặc tùy chỉnh)
   - **Client Session Idle**: 30 Minutes
   - **Client Session Max**: 10 Hours

## 6. Tạo User để test

1. Vào menu "Users"
2. Click "Add user"
3. Nhập thông tin:
   - **Username**: `testuser`
   - **Email**: `test@petstore.com`
   - **First name**: `Test`
   - **Last name**: `User`
   - **Email verified**: ON
4. Click "Create"

5. Đặt password:
   - Vào tab "Credentials"
   - Click "Set password"
   - Nhập password: `password123`
   - **Temporary**: OFF
   - Click "Save"

## 7. Tạo Roles (Optional)

1. Vào menu "Realm roles"
2. Click "Create role"
3. Tạo các roles:
   - `user` - Người dùng thông thường
   - `admin` - Quản trị viên
   - `customer` - Khách hàng

4. Gán role cho user:
   - Vào "Users" > chọn user
   - Tab "Role mapping"
   - Click "Assign role"
   - Chọn roles cần gán

## 8. Cấu hình CORS (nếu cần)

1. Vào "Clients" > `pet-client`
2. Tab "Advanced"
3. Tìm "Web Origins":
   - Thêm: `http://localhost:4200`
   - Thêm: `http://localhost:4201`
   - Hoặc dùng `*` cho development (KHÔNG khuyến nghị cho production)

## 9. Test cấu hình

### Kiểm tra endpoint
```bash
# Lấy configuration
curl http://localhost:9090/auth/realms/pet-realm/.well-known/openid-configuration

# Test login
curl -X POST http://localhost:9090/auth/realms/pet-realm/protocol/openid-connect/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=testuser" \
  -d "password=password123" \
  -d "grant_type=password" \
  -d "client_id=pet-client"
```

## 10. Cấu hình trong Angular App

File đã được cấu hình tại: `fe/projects/shell/src/environments/environment.ts`

```typescript
export const environment = {
  keycloak: {
    url: 'http://localhost:9090/auth',
    realm: 'pet-realm',
    clientId: 'pet-client'
  }
};
```

## 11. Khởi động ứng dụng

```bash
cd fe
npm install
npm start
```

## 12. Test SSO Flow

1. Truy cập: http://localhost:4200
2. Click vào "Products" (route được bảo vệ)
3. Bạn sẽ được redirect đến trang login Keycloak
4. Đăng nhập với:
   - Username: `testuser`
   - Password: `password123`
5. Sau khi đăng nhập thành công, bạn sẽ được redirect về trang products

## Troubleshooting

### Lỗi 404 - 3p-cookies
- Đã fix bằng cách thêm `checkLoginIframe: false` trong config
- File: `fe/projects/shell/src/app/app.config.ts`

### Lỗi CORS
- Kiểm tra Web Origins trong Keycloak client settings
- Đảm bảo URL frontend được thêm vào Valid Redirect URIs

### Token không được gửi trong request
- Kiểm tra HTTP Interceptor đã được cấu hình
- File: `fe/projects/shell/src/app/interceptors/auth.interceptor.ts`

### Không redirect sau khi login
- Kiểm tra Valid Redirect URIs trong Keycloak
- Kiểm tra AuthGuard logic

## Các tính năng đã implement

✅ **SSO Login với Keycloak**
- Tự động redirect đến Keycloak khi truy cập route được bảo vệ
- Silent SSO check để duy trì session

✅ **AuthGuard**
- Bảo vệ routes cần authentication
- Hỗ trợ role-based access control

✅ **HTTP Interceptor**
- Tự động thêm Bearer token vào mọi API request
- Exclude các URL không cần token

✅ **AuthService**
- Quản lý authentication state
- Lấy user profile và roles
- Refresh token tự động

✅ **Header Component**
- Hiển thị trạng thái login
- Nút Login/Logout
- Hiển thị username

✅ **Unauthorized Page**
- Trang thông báo khi không có quyền truy cập

## Cấu trúc files đã tạo

```
fe/projects/shell/src/
├── app/
│   ├── guards/
│   │   └── auth.guard.ts              # Route guard
│   ├── interceptors/
│   │   └── auth.interceptor.ts        # HTTP interceptor
│   ├── unauthorized/
│   │   └── unauthorized.component.ts  # Unauthorized page
│   ├── app.config.ts                  # App config với Keycloak
│   └── app.routes.ts                  # Routes với AuthGuard
├── service/
│   └── auth.service.ts                # Auth service
└── environments/
    └── environment.ts                 # Keycloak config
```

## Next Steps

1. **Thêm role-based authorization**: Phân quyền chi tiết hơn cho các chức năng
2. **Implement refresh token**: Tự động refresh khi token hết hạn
3. **Add logout confirmation**: Xác nhận trước khi logout
4. **Session management**: Quản lý session timeout
5. **Remember me**: Lưu session lâu hơn
