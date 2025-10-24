# 🔐 Google OAuth Configuration Guide

## ❌ Vấn đề: OAuth 2.0 Redirect URI Mismatch

### Lỗi thường gặp:

```
Error 400: redirect_uri_mismatch
The redirect URI in the request, http://localhost:4200/auth/callback, does not match
the ones authorized for the OAuth client.
```

---

## ✅ Giải pháp

### Bước 1: Kiểm tra URI trong code

**File:** `be/auth-api/src/main/resources/application.yml`

```yaml
google:
  oauth:
    redirect-uri: http://localhost:4200/auth/callback
```

### Bước 2: Cập nhật Google Console

1. Đi đến [Google Cloud Console](https://console.cloud.google.com/)
2. Chọn project của bạn
3. Đi đến **APIs & Services** → **Credentials**
4. Click vào OAuth 2.0 Client ID của bạn
5. Trong phần **Authorized redirect URIs**, thêm:

```
http://localhost:4200/auth/callback
http://localhost:4200/auth/google/callback
http://localhost:8090/api/auth/google/callback
http://localhost:8088/api/auth/google/callback
```

**Screenshot từ console của bạn:**

```
URIs 1: http://localhost
URIs 2: http://localhost:4200
```

**Cần thêm path đầy đủ:**

```
URIs 1: http://localhost
URIs 2: http://localhost:4200
URIs 3: http://localhost:4200/auth/callback          ← THÊM CÁI NÀY
URIs 4: http://localhost:4200/auth/google/callback   ← HOẶC CÁI NÀY
```

### Bước 3: Click Save và đợi vài phút

Google cần thời gian để cập nhật cấu hình (thường 1-5 phút).

---

## 📋 URIs cần thiết cho development

### Frontend (Angular - Port 4200):

```
http://localhost:4200
http://localhost:4200/auth/callback
http://localhost:4200/auth/google/callback
```

### Backend Auth API (Port 8090):

```
http://localhost:8090/api/auth/google/callback
```

### Backend Gateway (Port 8088):

```
http://localhost:8088/api/auth/google/callback
```

---

## 🔄 OAuth Flow

```
1. User clicks "Login with Google"
   ↓
2. Redirect to Google: https://accounts.google.com/o/oauth2/v2/auth?
   client_id=YOUR_CLIENT_ID&
   redirect_uri=http://localhost:4200/auth/callback&  ← PHẢI KHỚP!
   response_type=code&
   scope=openid email profile
   ↓
3. User logs in with Google
   ↓
4. Google redirects back: http://localhost:4200/auth/callback?code=...
   ↓
5. Frontend sends code to backend
   ↓
6. Backend exchanges code for token
   ↓
7. Backend returns JWT to frontend
```

---

## 🛠️ Cách sửa nhanh

### Option 1: Đổi code để dùng URI đơn giản (đã có trong console)

**File:** `be/auth-api/src/main/resources/application.yml`

```yaml
google:
  oauth:
    redirect-uri: http://localhost:4200 # Bỏ /auth/callback
```

**File:** Frontend routing

```typescript
// Thay đổi route callback
{ path: '', component: LoginComponent }  // Thay vì '/auth/callback'
```

### Option 2: Thêm URI đầy đủ vào Google Console (Khuyến nghị)

Giữ nguyên code, chỉ cần thêm URI vào Google Console như hướng dẫn ở trên.

---

## ✅ Checklist

- [ ] URI trong code KHỚP CHÍNH XÁC với URI trong Google Console
- [ ] Đã click Save trong Google Console
- [ ] Đợi 1-5 phút để Google cập nhật
- [ ] Clear browser cache và cookies
- [ ] Test lại login flow
- [ ] Kiểm tra console log để xem redirect_uri được gửi đi

---

## 🐛 Debug

### Kiểm tra URI đang được sử dụng:

**Backend log:**

```bash
# Xem log khi start auth-api
grep -i "redirect" logs/auth-api.log
```

**Frontend (Browser console):**

```javascript
// Khi click "Login with Google", check URL redirect:
// Nó sẽ như này:
https://accounts.google.com/o/oauth2/v2/auth?client_id=...&redirect_uri=http://localhost:4200/auth/callback

// redirect_uri phải KHỚP với URI trong Google Console!
```

### Test với cURL:

```bash
# Get authorization URL
curl http://localhost:8090/api/auth/google/authorization-url

# Response sẽ có redirect_uri parameter
# Check xem có khớp với Google Console không
```

---

## 🌐 URIs cho Production

Khi deploy lên production, nhớ thêm:

```
https://yourdomain.com/auth/callback
https://yourdomain.com/auth/google/callback
https://api.yourdomain.com/api/auth/google/callback
```

**Lưu ý:** Production PHẢI dùng HTTPS, không được dùng HTTP!

---

## 📚 Tài liệu tham khảo

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Redirect URI Validation Rules](https://developers.google.com/identity/protocols/oauth2/web-server#uri-validation)

---

**Created:** 2025-10-24
**Author:** GitHub Copilot
