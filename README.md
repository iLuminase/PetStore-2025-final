# 🐾 PetStore Microservices E-Commerce Platform

A modern, full-stack e-commerce application built with **microservices architecture**, featuring Spring Boot backend and Angular frontend with Module Federation.

![Java](https://img.shields.io/badge/Java-17-orange)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3.5-brightgreen)
![Angular](https://img.shields.io/badge/Angular-20.3-red)
![MySQL](https://img.shields.io/badge/MySQL-8.0-blue)
![License](https://img.shields.io/badge/License-MIT-yellow)

## 📋 Table of Contents

- [Features](#-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Quick Start](#-quick-start)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)
- [Screenshots](#-screenshots)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### 🛒 E-Commerce Core

- **Product Management**: CRUD operations with categories, brands, and stock management
- **Shopping Cart**: Add/remove products, update quantities, real-time cart updates
- **User Authentication**: JWT-based auth with role-based access control (USER, ADMIN, MANAGER)
- **Order Management**: Order creation, status tracking, and history

### 🖼️ Advanced Features

- **Image Storage**: Store product images in database (BLOB) with fallback mechanism
- **Real-time Updates**: Cart and product updates without page refresh
- **Responsive Design**: Mobile-first UI with modern CSS
- **Search & Filter**: Product search by name, category, price range
- **Pagination**: Efficient data loading with pagination support

### 🔐 Security

- JWT authentication and authorization
- Role-based access control (RBAC)
- Password encryption with BCrypt
- CORS configuration for cross-origin requests

---

## 🏗️ Architecture

### Microservices Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Angular   │────▶│   Gateway   │────▶│   Auth API  │
│   (Shell)   │     │   API:8080  │     │   :8081     │
└─────────────┘     └─────────────┘     └─────────────┘
                           │                     │
                           ├────────────────────┤
                           │                     │
                    ┌──────▼──────┐      ┌──────▼──────┐
                    │ Product API │      │  Cart API   │
                    │   :8082     │      │   :8083     │
                    └─────────────┘      └─────────────┘
                           │                     │
                           └──────────┬──────────┘
                                      │
                              ┌───────▼────────┐
                              │   MySQL DB     │
                              │  store-db      │
                              │  system-db     │
                              └────────────────┘
```

### Frontend Architecture (Module Federation)

```
┌──────────────────────────────────────────┐
│          Shell App (:4200)               │
│  - Main layout                           │
│  - Routing                               │
│  - Auth state management                 │
└──────────┬───────────────────────────────┘
           │
    ┌──────┴──────┬──────────┐
    │             │          │
┌───▼────┐  ┌────▼───┐  ┌──▼────┐
│Products│  │ Shared │  │ More  │
│ :4201  │  │ :4202  │  │ ...   │
└────────┘  └────────┘  └───────┘
```

---

## 🛠️ Tech Stack

### Backend

- **Java 21**
- **Spring Boot 3.3.5**
- **Spring Cloud Gateway** - API Gateway
- **Spring Security** - Authentication & Authorization
- **Spring Data JPA** - ORM
- **MySQL 8.0** - Database
- **JWT** - Token-based authentication
- **Maven** - Build tool

### Frontend

- **Angular 20.3** - Frontend framework
- **TypeScript 5.7** - Programming language
- **RxJS** - Reactive programming
- **Angular Router** - Navigation
- **Module Federation** - Micro-frontend architecture
- **SCSS** - Styling

### DevOps & Tools

- **Git** - Version control
- **Docker** (optional) - Containerization
- **MySQL Workbench** - Database management
- **Postman** - API testing

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Java 17+** - [Download](https://www.oracle.com/java/technologies/downloads/)
- **Maven 3.6+** - [Download](https://maven.apache.org/download.cgi)
- **Node.js 18+** - [Download](https://nodejs.org/)
- **MySQL 8.0+** - [Download](https://dev.mysql.com/downloads/)
- **Git** - [Download](https://git-scm.com/downloads)

---

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/petstore-microservices.git
cd petstore-microservices
```

### 2. Setup Database

The application requires **two MySQL databases**:

- `system-db` - For authentication and user management
- `store-db` - For products, cart, and orders

#### Option A: Using MySQL Command Line (Recommended)

```bash
# Navigate to project directory
cd petstore-microservices

# Login to MySQL
mysql -u root -p

# Run the complete setup script
source database/setup-databases.sql

# Exit MySQL
exit
```

#### Option B: Using MySQL Workbench

1. Open MySQL Workbench
2. Connect to your MySQL server (localhost:3306)
3. **File** → **Open SQL Script**
4. Select `database/setup-databases.sql`
5. Click **Execute** (⚡ icon)

#### Option C: Using PowerShell

```powershell
# Navigate to project directory
cd d:\DoAnVNPT_LTUDJava\petStore-new

# Run setup script
Get-Content database\setup-databases.sql | mysql -u root -p
```

#### Verify Database Setup

```sql
-- Connect to MySQL
mysql -u root -p

-- Check databases
SHOW DATABASES;

-- Verify system-db (should show 2 users)
USE `system-db`;
SELECT username, email, role FROM users;

-- Verify store-db (should show 8 products)
USE `store-db`;
SELECT id, name, price, stock, category FROM product;
```

**Expected Output:**

- ✅ 2 users in `system-db.users` (admin, user)
- ✅ 8 sample products in `store-db.product`

#### Migration for Existing Database

If you already have data and need to add image support:

```bash
# Update existing product table
mysql -u root -p store-db < database/alter-product-table.sql
```

📖 **For detailed database documentation, see:** [database/README.md](database/README.md)

### 3. Configure OAuth (Optional)

If using Google OAuth login, update credentials:

```bash
# Copy example file
cp .env.example .env

# Edit .env with your Google OAuth credentials
# Get credentials from: https://console.cloud.google.com/apis/credentials
```

Or add default values to `be/auth-api/src/main/resources/application.yml`:

```yaml
google:
  oauth:
    client-id: ${GOOGLE_CLIENT_ID:your-client-id}
    client-secret: ${GOOGLE_CLIENT_SECRET:your-client-secret}
```

### 4. Start Backend Services

Open 4 terminals and run each service:

```bash
# Terminal 1 - Gateway API (Port 8080)
cd be/gateway-api
mvn spring-boot:run

# Terminal 2 - Auth API (Port 8081)
cd be/auth-api
mvn spring-boot:run

# Terminal 3 - Product API (Port 8082)
cd be/product-api
mvn spring-boot:run

# Terminal 4 - Cart API (Port 8083)
cd be/cart-api
mvn spring-boot:run
```

**Wait for all services to start successfully** before proceeding to frontend.

Check startup logs for:

- ✅ `Tomcat started on port(s): XXXX`
- ✅ `Started [ServiceName]Application`

### 5. Start Frontend

```bash
cd fe

# Install dependencies (first time only)
npm install

# Start all microfrontends
npm run start:all

# Or start individually
npm run start:shell      # Port 4200
npm run start:products   # Port 4201
npm run start:shared     # Port 4202
```

### 6. Access the Application

- **Frontend**: http://localhost:4200
- **Gateway API**: http://localhost:8080
- **Auth API**: http://localhost:8081
- **Product API**: http://localhost:8082
- **Cart API**: http://localhost:8083

### 7. Default Credentials

```
Username: admin
Password: admin123
Role: ADMIN
```

---

## 📁 Project Structure

```
petstore-microservices/
├── be/                          # Backend services
│   ├── gateway-api/             # API Gateway (Port 8080)
│   ├── auth-api/                # Authentication service (Port 8081)
│   ├── product-api/             # Product management (Port 8082)
│   └── cart-api/                # Shopping cart (Port 8083)
│
├── fe/                          # Frontend applications
│   ├── projects/
│   │   ├── shell/               # Main shell app (Port 4200)
│   │   ├── products/            # Products microfrontend (Port 4201)
│   │   └── shared/              # Shared library (Port 4202)
│   └── package.json
│
├── database/                    # Database scripts
│   ├── setup-databases.sql      # Complete database setup
│   ├── alter-product-table.sql  # Migration for existing DB
│   └── README.md                # Database documentation
│
├── docs/                        # Documentation
│   ├── ARCHITECTURE.md
│   ├── IMAGE_SUPPORT.md
│   └── DEPLOY_GITHUB.md
│
├── .gitignore
├── README.md
└── clean-before-push.ps1        # Cleanup script
```

---

## 📚 API Documentation

### Authentication API

#### Register

```http
POST http://localhost:8080/api/auth/register
Content-Type: application/json

{
  "username": "user123",
  "password": "password123",
  "email": "user@example.com"
}
```

#### Login

```http
POST http://localhost:8080/api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

### Product API

#### Get All Products (with pagination)

```http
GET http://localhost:8080/api/products?page=0&size=10
```

#### Get Product by ID

```http
GET http://localhost:8080/api/products/1
```

#### Create Product (Admin only)

```http
POST http://localhost:8080/api/products
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "name": "Dog Food Premium",
  "description": "High quality dog food",
  "price": 29.99,
  "stockQuantity": 100,
  "category": "Food",
  "brand": "PetFood Co"
}
```

#### Upload Product Image

```http
POST http://localhost:8080/api/products/1/image
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: multipart/form-data

file: [binary image data]
```

#### Get Product Image

```http
GET http://localhost:8080/api/products/1/image
```

### Cart API

#### Get Cart

```http
GET http://localhost:8080/api/cart
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Add to Cart

```http
POST http://localhost:8080/api/cart/add
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "productId": 1,
  "quantity": 2,
  "price": 29.99,
  "productName": "Dog Food",
  "productImage": "/api/products/1/image"
}
```

#### Update Cart Item

```http
PUT http://localhost:8080/api/cart/product/1
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "quantity": 5
}
```

#### Remove from Cart

```http
DELETE http://localhost:8080/api/cart/product/1
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## 🖼️ Screenshots

### Homepage

![Homepage](docs/screenshots/homepage.png)

### Product List

![Product List](docs/screenshots/product-list.png)

### Shopping Cart

![Shopping Cart](docs/screenshots/cart.png)

### Admin Dashboard

![Admin Dashboard](docs/screenshots/admin.png)

---

## 🧪 Testing

### Backend Tests

```bash
# Run all tests
cd be/product-api
mvn test

# Run with coverage
mvn test jacoco:report
```

### Frontend Tests

```bash
cd fe
npm test

# Run with coverage
npm run test:coverage
```

---

## 🚢 Deployment

### Docker Deployment (Coming Soon)

```bash
docker-compose up -d
```

### Manual Deployment

See [DEPLOY_GITHUB.md](DEPLOY_GITHUB.md) for detailed deployment instructions.

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Authors

- **Your Name** - _Initial work_ - [YourGitHub](https://github.com/yourusername)

---

## 🙏 Acknowledgments

- Spring Boot team for the excellent framework
- Angular team for the powerful frontend framework
- Module Federation for micro-frontend architecture
- All contributors who help improve this project

---

## 📞 Contact

- **Email**: your.email@example.com
- **GitHub**: [@yourusername](https://github.com/yourusername)
- **LinkedIn**: [Your Name](https://linkedin.com/in/yourname)

---

## 🔗 Related Documentation

- [Architecture Documentation](be/ARCHITECTURE.md)
- [Image Support Guide](be/product-api/IMAGE_SUPPORT.md)
- [GitHub Deployment Guide](DEPLOY_GITHUB.md)
- [Changelog](CHANGELOG_PRODUCT_IMAGE.md)

---

**⭐ If you like this project, please give it a star on GitHub! ⭐**

**📅 Last Updated:** October 24, 2025
