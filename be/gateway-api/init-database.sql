-- Tạo database system-db nếu chưa có
CREATE DATABASE IF NOT EXISTS `system-db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE `system-db`;

-- Xóa bảng users cũ nếu có để tạo lại
DROP TABLE IF EXISTS `users`;

-- Tạo bảng users
CREATE TABLE `users` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `email` varchar(100) NOT NULL,
  `full_name` varchar(100) DEFAULT NULL,
  `phone_number` varchar(20) DEFAULT NULL,
  `role` enum('USER','ADMIN','MANAGER') DEFAULT 'USER',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Lưu ý: Sử dụng endpoint GET /api/auth/hash/admin123 để lấy password hash
-- Sau đó update password trong SQL này và chạy lại

-- Hiển thị hướng dẫn
SELECT 'Hãy call GET /api/auth/hash/admin123 để lấy password hash, sau đó update SQL này' AS instruction;