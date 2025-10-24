package com.cart_api.repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.cart_api.models.CartItem;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    
    // Find all cart items by user ID
    List<CartItem> findByUserId(Long userId);
    
    // Find cart item by user ID and product ID
    Optional<CartItem> findByUserIdAndProductId(Long userId, Long productId);
    
    // Delete all cart items by user ID
    void deleteByUserId(Long userId);
    
    // Delete cart item by user ID and product ID
    void deleteByUserIdAndProductId(Long userId, Long productId);
    
    // Check if cart item exists for user and product
    boolean existsByUserIdAndProductId(Long userId, Long productId);
    
    // Count cart items by user ID
    long countByUserId(Long userId);
    
    // Calculate total cart value for user
    @Query("SELECT SUM(c.price * c.quantity) FROM CartItem c WHERE c.userId = :userId")
    BigDecimal calculateTotalCartValue(@Param("userId") Long userId);
    
    // Get total quantity of items in cart for user
    @Query("SELECT SUM(c.quantity) FROM CartItem c WHERE c.userId = :userId")
    Integer getTotalCartQuantity(@Param("userId") Long userId);
}