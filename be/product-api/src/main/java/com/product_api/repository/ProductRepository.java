package com.product_api.repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.product_api.models.Product;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    
    // Find active products only
    List<Product> findByActiveTrue();
    
    // Find by name containing (case insensitive)
    List<Product> findByNameContainingIgnoreCase(String name);
    
    // Find by categoryId
    List<Product> findByCategoryIdAndActiveTrue(Long categoryId);
    
    // Find by brand
    List<Product> findByBrandAndActiveTrue(String brand);
    
    // Find by price range
    List<Product> findByPriceBetweenAndActiveTrue(BigDecimal minPrice, BigDecimal maxPrice);
    
    // Find products with stock available
    @Query("SELECT p FROM Product p WHERE p.stock > 0 AND p.active = true")
    List<Product> findAvailableProducts();
    
    // Find products by category with pagination
    Page<Product> findByCategoryIdAndActiveTrue(Long categoryId, Pageable pageable);
    
    // Search products by name or description
    @Query("SELECT p FROM Product p WHERE (LOWER(p.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) " +
           "OR LOWER(p.description) LIKE LOWER(CONCAT('%', :searchTerm, '%'))) AND p.active = true")
    Page<Product> searchProducts(@Param("searchTerm") String searchTerm, Pageable pageable);
    
    // Find products with low stock (sorted by newest first)
    @Query("SELECT p FROM Product p WHERE p.stock <= :threshold AND p.active = true ORDER BY p.createdAt DESC")
    List<Product> findLowStockProducts(@Param("threshold") Integer threshold);
    
    // Get all distinct categoryIds
    @Query("SELECT DISTINCT p.categoryId FROM Product p WHERE p.active = true AND p.categoryId IS NOT NULL")
    List<Long> findDistinctCategoryIds();
    
    // Get all distinct brands
    @Query("SELECT DISTINCT p.brand FROM Product p WHERE p.active = true AND p.brand IS NOT NULL")
    List<String> findDistinctBrands();
    
    // Get all categories with their names (using join)
    @Query("SELECT c.name FROM Product p JOIN p.category c WHERE p.active = true AND c.active = true GROUP BY c.name")
    List<String> findDistinctCategoryNames();
    
    // Find by ID and active
    Optional<Product> findByIdAndActiveTrue(Long id);
}