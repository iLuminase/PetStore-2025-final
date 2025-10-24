# Product Image Support - Hướng dẫn sử dụng

## Tính năng mới

### 1. Lưu trữ hình ảnh trong Database

- Sản phẩm có thể lưu trữ hình ảnh trực tiếp trong database dưới dạng BLOB
- Hỗ trợ các định dạng: JPEG, PNG, GIF, WebP
- Giới hạn kích thước: 5MB mỗi ảnh

### 2. Ưu tiên hiển thị ảnh

Hệ thống sẽ hiển thị ảnh theo thứ tự ưu tiên:

1. **imageUrl** - Nếu có URL ảnh (external hoặc CDN)
2. **Database Image** - Nếu có ảnh lưu trong DB (`/api/products/{id}/image`)
3. **Placeholder** - Ảnh mặc định nếu không có ảnh nào

### 3. API Endpoints mới

#### Upload ảnh cho sản phẩm

```http
POST /api/products/{id}/image
Content-Type: multipart/form-data

Form Data:
- file: [image file]
```

**Response:**

```json
{
  "message": "Image uploaded successfully",
  "imageUrl": "/api/products/1/image"
}
```

#### Lấy ảnh sản phẩm

```http
GET /api/products/{id}/image
```

**Response:** Binary image data với Content-Type phù hợp (image/jpeg, image/png, etc.)

#### Xóa ảnh sản phẩm

```http
DELETE /api/products/{id}/image
```

**Response:**

```json
{
  "message": "Image deleted successfully"
}
```

## Cài đặt

### 1. Cập nhật Database

#### Nếu database mới (chưa có dữ liệu):

```bash
mysql -u root -p < database/setup-databases.sql
```

#### Nếu database đã có (migration):

```bash
mysql -u root -p < database/migration-add-image-support.sql
```

### 2. Restart Backend Services

```bash
# Restart Product API
cd be/product-api
mvn spring-boot:run

# Restart Gateway API
cd be/gateway-api
mvn spring-boot:run
```

### 3. Frontend không cần thay đổi

Frontend đã được cập nhật tự động để:

- Ưu tiên hiển thị ảnh từ database nếu có
- Fallback sang placeholder nếu không có ảnh hoặc lỗi

## Sử dụng

### Upload ảnh qua API

**Curl example:**

```bash
curl -X POST http://localhost:8088/api/products/1/image \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@/path/to/image.jpg"
```

**JavaScript example:**

```javascript
const formData = new FormData();
formData.append("file", imageFile);

fetch("http://localhost:8088/api/products/1/image", {
  method: "POST",
  headers: {
    Authorization: "Bearer " + token,
  },
  body: formData,
})
  .then((response) => response.json())
  .then((data) => console.log(data));
```

### Hiển thị ảnh trong Frontend

Ảnh sẽ tự động được hiển thị theo ưu tiên:

```html
<!-- Product List -->
<img
  [src]="getProductImageUrl(product)"
  [alt]="product.name"
  (error)="handleImageError($event)"
/>

<!-- Product Detail -->
<img
  [src]="getProductImageUrl()"
  [alt]="product.name"
  (error)="handleImageError($event)"
/>
```

## Khắc phục lỗi

### 1. Lỗi tải product list không ổn định

**Nguyên nhân:**

- Schema mismatch giữa DB và Entity (enabled vs active)
- Thiếu error handling

**Giải pháp đã áp dụng:**

- ✅ Cập nhật schema để khớp với entity model
- ✅ Thêm validation cho pagination parameters
- ✅ Cải thiện error logging và handling
- ✅ Thêm cache control cho image endpoint

### 2. Ảnh không hiển thị

**Kiểm tra:**

1. Check database có cột `image_data` và `image_type` chưa
2. Check product có ảnh trong DB không:

```sql
SELECT id, name,
       LENGTH(image_data) as image_size,
       image_type
FROM product
WHERE image_data IS NOT NULL;
```

3. Check console log cho errors
4. Thử access trực tiếp: `http://localhost:8088/api/products/1/image`

### 3. Upload ảnh bị lỗi

**Kiểm tra:**

- File size < 5MB
- File type là image (JPEG, PNG, GIF, WebP)
- Có token authentication hợp lệ
- Product ID tồn tại

## Database Schema

### Bảng `product`

```sql
CREATE TABLE `product` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `description` TEXT,
    `price` DECIMAL(10,2) NOT NULL,
    `stock_quantity` INT DEFAULT 0,
    `category` VARCHAR(100),
    `brand` VARCHAR(50),
    `image_url` VARCHAR(500),
    `image_data` LONGBLOB,           -- NEW: Binary image data
    `image_type` VARCHAR(50),        -- NEW: MIME type
    `active` BOOLEAN DEFAULT TRUE,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_category` (`category`),
    INDEX `idx_active` (`active`),
    INDEX `idx_brand` (`brand`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

## Performance Tips

1. **Caching**: Image endpoint có cache-control header (1 hour)
2. **CDN**: Nên dùng imageUrl với CDN cho ảnh lớn, chỉ dùng DB cho ảnh nhỏ
3. **Compression**: Nén ảnh trước khi upload (recommended max 1MB)
4. **Lazy loading**: Frontend đã implement lazy loading cho images

## Testing

### Test upload ảnh:

```bash
# Upload test image
curl -X POST http://localhost:8088/api/products/1/image \
  -F "file=@test-image.jpg"

# Get image
curl http://localhost:8088/api/products/1/image --output test-download.jpg

# Delete image
curl -X DELETE http://localhost:8088/api/products/1/image
```

## Troubleshooting Commands

```sql
-- Check table structure
DESCRIBE product;

-- Check products with images
SELECT id, name,
       CASE WHEN image_data IS NOT NULL THEN 'YES' ELSE 'NO' END as has_image,
       image_type,
       LENGTH(image_data) as size_bytes
FROM product;

-- Clear all images (if needed)
UPDATE product SET image_data = NULL, image_type = NULL;
```

## Notes

- **Backup**: Luôn backup database trước khi chạy migration
- **Storage**: LONGBLOB có giới hạn 4GB nhưng recommend < 5MB/image
- **Memory**: Backend cần đủ memory để xử lý upload/download ảnh lớn
- **Network**: Ảnh từ DB có thể chậm hơn CDN, nên dùng cho preview/thumbnail
