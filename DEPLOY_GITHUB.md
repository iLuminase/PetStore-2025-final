# 🚀 Hướng dẫn đẩy dự án lên GitHub

## 📋 Chuẩn bị

### 1. Kiểm tra các file đã được ignore

```bash
# Kiểm tra các file sẽ được commit
git status

# Kiểm tra xem .gitignore có hoạt động không
git check-ignore -v node_modules/
git check-ignore -v target/
git check-ignore -v .angular/
```

### 2. Các thư mục/file sẽ KHÔNG được đẩy lên (đã ignore):

#### Backend:

- ✅ `target/` - Maven build outputs (~100MB-500MB)
- ✅ `*.jar`, `*.war` - Compiled artifacts
- ✅ `.mvn/wrapper/maven-wrapper.jar`
- ✅ Build và test reports
- ✅ IDE files (.idea/, \*.iml)

#### Frontend:

- ✅ `node_modules/` - Dependencies (~500MB-1GB)
- ✅ `.angular/cache/` - Angular cache (~100MB-300MB)
- ✅ `dist/` - Build outputs (~50MB-100MB)
- ✅ IDE files (.vscode/, .idea/)

#### Tổng cộng tiết kiệm: **~1-2GB** dung lượng!

---

## 🔧 Các bước đẩy lên GitHub

### Bước 1: Khởi tạo Git repository (nếu chưa có)

```bash
cd d:\DoAnVNPT_LTUDJava\petStore-new

# Khởi tạo git
git init

# Kiểm tra branch hiện tại
git branch
```

### Bước 2: Add và commit các file

```bash
# Add tất cả files (trừ những file trong .gitignore)
git add .

# Kiểm tra những gì sẽ được commit
git status

# Commit
git commit -m "Initial commit: PetStore microservices project with image support"
```

### Bước 3: Tạo repository trên GitHub

1. Đi đến https://github.com/new
2. Repository name: `petstore-microservices` (hoặc tên bạn muốn)
3. Description: "Pet Store e-commerce with microservices architecture (Spring Boot + Angular)"
4. **QUAN TRỌNG**: Chọn **Public** hoặc **Private**
5. **KHÔNG** chọn "Initialize with README" (vì đã có sẵn)
6. Click **Create repository**

### Bước 4: Kết nối và push lên GitHub

```bash
# Thay YOUR_USERNAME và YOUR_REPO bằng thông tin của bạn
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git

# Đổi tên branch sang main (nếu đang là master)
git branch -M main

# Push lên GitHub
git push -u origin main
```

**Ví dụ:**

```bash
git remote add origin https://github.com/nguyenvana/petstore-microservices.git
git branch -M main
git push -u origin main
```

---

## ⚠️ Xử lý nếu bị lỗi

### Lỗi 1: Repository quá lớn

**Triệu chứng:**

```
remote: error: File abc.jar is 150MB; this exceeds GitHub's file size limit of 100MB
```

**Giải pháp:**

```bash
# Xóa file khỏi git (nhưng giữ lại trên local)
git rm --cached path/to/large-file.jar

# Thêm vào .gitignore
echo "path/to/large-file.jar" >> .gitignore

# Commit lại
git add .gitignore
git commit -m "Remove large files and update gitignore"
```

### Lỗi 2: node_modules đã được add nhầm

```bash
# Xóa node_modules khỏi git
git rm -r --cached fe/node_modules

# Commit
git commit -m "Remove node_modules from git"
git push
```

### Lỗi 3: .angular cache đã được add

```bash
# Xóa .angular cache
git rm -r --cached fe/.angular

# Commit
git commit -m "Remove .angular cache from git"
git push
```

---

## 🧹 Clean up trước khi push (Khuyến nghị)

```bash
# 1. Clean Maven builds
cd be/product-api && mvn clean && cd ../..
cd be/gateway-api && mvn clean && cd ../..
cd be/auth-api && mvn clean && cd ../..
cd be/cart-api && mvn clean && cd ../..

# 2. Clean Angular build và cache
cd fe
rm -rf node_modules
rm -rf .angular
rm -rf dist
cd ..

# 3. Verify kích thước
git count-objects -vH
```

---

## 📊 Kiểm tra kích thước repository

```bash
# Kiểm tra tổng kích thước
git count-objects -vH

# Tìm các file lớn nhất
git rev-list --objects --all | \
  git cat-file --batch-check='%(objecttype) %(objectname) %(objectsize) %(rest)' | \
  sed -n 's/^blob //p' | \
  sort --numeric-sort --key=2 | \
  tail -n 10

# Hoặc dùng PowerShell (Windows)
git ls-files | ForEach-Object {
    [PSCustomObject]@{
        File = $_
        Size = (Get-Item $_).Length / 1MB
    }
} | Sort-Object Size -Descending | Select-Object -First 20
```

---

## 📝 Cấu trúc dự án sẽ được push

```
petStore-new/
├── .gitignore                    # Root gitignore
├── README.md
├── package.json
├── CHANGELOG_PRODUCT_IMAGE.md
├── DEPLOY_GITHUB.md             # (file này)
│
├── be/                          # Backend
│   ├── .gitignore               # Backend gitignore
│   ├── auth-api/
│   │   ├── src/
│   │   ├── pom.xml
│   │   └── mvnw
│   ├── product-api/
│   │   ├── src/
│   │   ├── pom.xml
│   │   ├── IMAGE_SUPPORT.md
│   │   └── mvnw
│   ├── gateway-api/
│   │   ├── src/
│   │   ├── pom.xml
│   │   └── mvnw
│   └── cart-api/
│       ├── src/
│       ├── pom.xml
│       └── mvnw
│
├── fe/                          # Frontend
│   ├── .gitignore               # Frontend gitignore
│   ├── package.json
│   ├── angular.json
│   ├── tsconfig.json
│   └── projects/
│       ├── shell/
│       ├── products/
│       └── shared/
│
├── database/                    # Database scripts
│   ├── .gitignore
│   ├── setup-databases.sql
│   ├── alter-product-table.sql
│   └── migration-add-image-support.sql
│
└── logs/                        # (ignored)
```

---

## 🔐 Bảo mật

### Những gì KHÔNG nên push lên GitHub:

- ❌ Passwords trong application.yml
- ❌ JWT secret keys
- ❌ Database credentials
- ❌ API keys
- ❌ .env files

### Kiểm tra trước khi push:

```bash
# Tìm các file có thể chứa thông tin nhạy cảm
grep -r "password" --include="*.yml" --include="*.properties" .
grep -r "secret" --include="*.yml" --include="*.properties" .
grep -r "jdbc:mysql" --include="*.yml" .
```

### Nếu đã push nhầm credentials:

```bash
# 1. Đổi ngay passwords/secrets
# 2. Update file và commit
# 3. Force push (cẩn thận!)
git push --force

# 4. Hoặc dùng git-filter-repo để xóa lịch sử (khuyến nghị)
# https://github.com/newren/git-filter-repo
```

---

## 📤 Push các thay đổi tiếp theo

```bash
# Sau khi có thay đổi
git add .
git commit -m "Describe your changes here"
git push

# Hoặc commit từng phần cụ thể
git add be/product-api/
git commit -m "Add image upload feature to product API"
git push
```

---

## 🎯 Best Practices

### 1. Commit messages rõ ràng

```bash
# Tốt ✅
git commit -m "feat: Add image storage support in database"
git commit -m "fix: Fix product list loading issue"
git commit -m "docs: Update API documentation"

# Không tốt ❌
git commit -m "update"
git commit -m "fix bug"
git commit -m "changes"
```

### 2. Commit thường xuyên

```bash
# Commit từng feature nhỏ
git commit -m "feat: Add image_data column to product table"
git commit -m "feat: Implement image upload endpoint"
git commit -m "feat: Add image fallback in frontend"
```

### 3. Branch strategy

```bash
# Tạo branch cho features mới
git checkout -b feature/product-reviews
# ... làm việc ...
git commit -m "Add product reviews feature"
git push -u origin feature/product-reviews

# Merge vào main sau khi test
git checkout main
git merge feature/product-reviews
git push
```

---

## 📋 Checklist trước khi push

- [ ] Đã clean all build outputs (mvn clean, rm -rf node_modules)
- [ ] Đã kiểm tra .gitignore hoạt động đúng
- [ ] Không có passwords/secrets trong code
- [ ] Đã test lại project sau khi clean
- [ ] README.md được cập nhật
- [ ] Commit messages rõ ràng
- [ ] Repository size < 1GB (nếu free plan)

---

## 🆘 Support

Nếu gặp vấn đề:

1. Check git status: `git status`
2. Check git log: `git log --oneline -10`
3. Check remote: `git remote -v`
4. Force pull (cẩn thận): `git pull --force`
5. Reset về commit trước: `git reset --hard HEAD~1`

---

## 📚 Tài liệu tham khảo

- GitHub Docs: https://docs.github.com/
- Git Cheat Sheet: https://education.github.com/git-cheat-sheet-education.pdf
- .gitignore templates: https://github.com/github/gitignore

---

**Created:** 2025-10-24  
**Last Updated:** 2025-10-24
