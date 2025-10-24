# Database Setup Guide

## Overview

PetStore application uses **two MySQL databases**:

1. **`system-db`** - Authentication & User Management (port 3306)
2. **`store-db`** - Products, Cart, Orders (port 3306)

## Prerequisites

- MySQL 8.0+ installed and running
- MySQL root access (or user with CREATE DATABASE privileges)
- Default credentials: `root` / `admin123` (change in production!)

## Quick Setup

### Option 1: Using MySQL Command Line

```bash
# Connect to MySQL
mysql -u root -p

# Run the setup script
source database/setup-databases.sql

# Or in one command:
mysql -u root -p < database/setup-databases.sql
```

### Option 2: Using MySQL Workbench

1. Open MySQL Workbench
2. Connect to your local MySQL server
3. File → Open SQL Script
4. Select `database/setup-databases.sql`
5. Execute the script (⚡ icon)

### Option 3: Using PowerShell

```powershell
# Navigate to project root
cd d:\DoAnVNPT_LTUDJava\petStore-new

# Run setup script
Get-Content database\setup-databases.sql | mysql -u root -p
```

## Database Structure

### system-db

**Table: `users`**

- Stores user accounts for authentication
- Default users:
  - Username: `admin` / Password: `admin123` (ADMIN role)
  - Username: `user` / Password: `admin123` (USER role)

### store-db

**Table: `product`**

- Product catalog with 8 sample products
- Supports external image URLs and database BLOB storage
- Fields: name, description, price, stock, category, brand, etc.

**Table: `cart_item`**

- Shopping cart items per user
- Links users to products with quantities

**Table: `orders`** (Future implementation)

- Order history and tracking

**Table: `order_item`** (Future implementation)

- Individual items within orders

## Verification

After running the setup script, verify the databases:

```sql
-- Show databases
SHOW DATABASES;

-- Check system-db
USE `system-db`;
SELECT * FROM users;

-- Check store-db
USE `store-db`;
SELECT id, name, price, stock, category FROM product;
```

Expected output:

- 2 users in `system-db.users`
- 8 products in `store-db.product`

## Configuration in Applications

Each microservice connects to its respective database via `application.yml`:

### Auth API (port 8090)

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/system-db
    username: root
    password: admin123
```

### Product API (port 8082)

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/store-db
    username: root
    password: admin123
```

### Cart API (port 8083)

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/store-db
    username: root
    password: admin123
```

## Migration Scripts

If you have an existing database, use migration scripts:

- `migration-add-image-support.sql` - Adds image storage columns to product table
- `alter-product-table.sql` - Updates product table schema

## Troubleshooting

### Connection Failed

```
Error: Can't connect to MySQL server on 'localhost:3306'
```

**Solution:**

- Check if MySQL is running: `net start MySQL80` (Windows)
- Verify port 3306 is not blocked by firewall

### Access Denied

```
Error: Access denied for user 'root'@'localhost'
```

**Solution:**

- Verify MySQL credentials
- Update password in `application.yml` files

### Database Already Exists

```
Error: Can't create database 'system-db'; database exists
```

**Solution:**

- Script uses `CREATE DATABASE IF NOT EXISTS` - safe to re-run
- To reset, manually drop databases first:
  ```sql
  DROP DATABASE IF EXISTS `system-db`;
  DROP DATABASE IF EXISTS `store-db`;
  ```

## Security Notes

⚠️ **Production Deployment:**

- Change default passwords immediately
- Create dedicated MySQL users with limited privileges
- Use environment variables for credentials
- Enable SSL/TLS for database connections
- Regular backups with `mysqldump`

## Sample Data

The setup includes 8 sample products across categories:

- 🍖 Food: Dog/Cat food
- 🎾 Toys: Kong toy, Scratching post
- 🎒 Accessories: Carrier bag, Pet bowls
- 💊 Healthcare: Flea & tick collar
- ✂️ Grooming: Grooming kit

All products have active status and stock available for testing.
