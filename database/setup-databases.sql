-- =================================================================
-- PetStore Microservices - Database Setup Script
-- =================================================================
-- This script creates and initializes two databases:
-- 1. system-db: For authentication and user management
-- 2. store-db: For products, cart, and orders
-- =================================================================

-- Create databases if they don't exist
CREATE DATABASE IF NOT EXISTS `system-db` 
    CHARACTER SET utf8mb4 
    COLLATE utf8mb4_unicode_ci;

CREATE DATABASE IF NOT EXISTS `store-db` 
    CHARACTER SET utf8mb4 
    COLLATE utf8mb4_unicode_ci;

-- =================================================================
-- SYSTEM-DB: Authentication & User Management
-- =================================================================
USE `system-db`;

-- Users table for authentication
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(50) NOT NULL UNIQUE,
    `email` VARCHAR(100) NOT NULL UNIQUE,
    `password` VARCHAR(255) NOT NULL,
    `full_name` VARCHAR(100),
    `role` VARCHAR(20) NOT NULL DEFAULT 'USER',
    `enabled` BOOLEAN NOT NULL DEFAULT TRUE,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_username` (`username`),
    INDEX `idx_email` (`email`),
    INDEX `idx_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default admin user
-- Password: admin123 (hashed with BCrypt)
INSERT INTO `users` (`username`, `email`, `password`, `full_name`, `role`) VALUES
('admin', 'admin@petstore.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Administrator', 'ADMIN'),
('user', 'user@petstore.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Regular User', 'USER');

-- =================================================================
-- STORE-DB: Products, Cart, Orders
-- =================================================================
USE `store-db`;

-- Products table
DROP TABLE IF EXISTS `product`;
CREATE TABLE `product` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `description` TEXT,
    `price` DECIMAL(10,2) NOT NULL,
    `stock` INT NOT NULL DEFAULT 0,
    `category` VARCHAR(100),
    `brand` VARCHAR(50),
    `image_url` VARCHAR(500),
    `image_data` LONGBLOB,
    `image_type` VARCHAR(50),
    `active` BOOLEAN NOT NULL DEFAULT TRUE,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_category` (`category`),
    INDEX `idx_brand` (`brand`),
    INDEX `idx_active` (`active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sample products
INSERT INTO `product` (`name`, `description`, `price`, `stock`, `category`, `brand`, `image_url`, `active`) VALUES
('Royal Canin Adult Dog Food', 'Complete nutrition for adult dogs (1-7 years)', 450000, 50, 'Food', 'Royal Canin', 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119', TRUE),
('Whiskas Cat Food', 'Delicious meals for adult cats', 85000, 100, 'Food', 'Whiskas', 'https://images.unsplash.com/photo-1548247416-ec66f4900b2e', TRUE),
('Kong Classic Dog Toy', 'Durable rubber toy for dogs', 120000, 30, 'Toy', 'Kong', 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1', TRUE),
('Cat Scratching Post', 'Tall scratching post with sisal rope', 350000, 20, 'Toy', 'PetPals', 'https://images.unsplash.com/photo-1545249390-6bdfa286032f', TRUE),
('Pet Carrier Bag', 'Comfortable carrier for small pets', 280000, 15, 'Accessory', 'PetGear', 'https://images.unsplash.com/photo-1591769225440-811ad7d6eab3', TRUE),
('Stainless Steel Pet Bowl', 'Non-slip double bowl set', 95000, 40, 'Accessory', 'PetSafe', 'https://images.unsplash.com/photo-1591856378301-5c3db9e4b1c4', TRUE),
('Flea & Tick Collar', 'Long-lasting protection for 8 months', 180000, 60, 'Healthcare', 'Bayer', 'https://images.unsplash.com/photo-1450778869180-41d0601e046e', TRUE),
('Pet Grooming Kit', 'Complete grooming set with brushes and clippers', 520000, 12, 'Grooming', 'FURminator', 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7', TRUE);

-- Cart items table
DROP TABLE IF EXISTS `cart_item`;
CREATE TABLE `cart_item` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT NOT NULL,
    `product_id` BIGINT NOT NULL,
    `quantity` INT NOT NULL DEFAULT 1,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_user_product` (`user_id`, `product_id`),
    INDEX `idx_user_id` (`user_id`),
    INDEX `idx_product_id` (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Orders table (for future implementation)
DROP TABLE IF EXISTS `orders`;
CREATE TABLE `orders` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT NOT NULL,
    `total_amount` DECIMAL(10,2) NOT NULL,
    `status` VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    `shipping_address` TEXT,
    `payment_method` VARCHAR(50),
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_user_id` (`user_id`),
    INDEX `idx_status` (`status`),
    INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Order items table (for future implementation)
DROP TABLE IF EXISTS `order_item`;
CREATE TABLE `order_item` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `order_id` BIGINT NOT NULL,
    `product_id` BIGINT NOT NULL,
    `product_name` VARCHAR(255) NOT NULL,
    `quantity` INT NOT NULL,
    `price` DECIMAL(10,2) NOT NULL,
    `subtotal` DECIMAL(10,2) NOT NULL,
    PRIMARY KEY (`id`),
    INDEX `idx_order_id` (`order_id`),
    INDEX `idx_product_id` (`product_id`),
    CONSTRAINT `fk_order_item_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =================================================================
-- Verification queries
-- =================================================================
SELECT 'Database setup completed successfully!' AS Status;
SELECT 'system-db' AS Database, COUNT(*) AS Users FROM `system-db`.`users`;
SELECT 'store-db' AS Database, COUNT(*) AS Products FROM `store-db`.`product`;
