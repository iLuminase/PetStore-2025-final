package com.cart_api.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class CartItemResponse {
    
    private Long id;
    private Long productId;
    private Long userId;
    private Integer quantity;
    private BigDecimal price;
    private BigDecimal subtotal; // price * quantity
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Additional product info (if needed)
    private String productName;
    private String productImage;
    private String productCategory;
    private boolean productAvailable;
    
    // Constructors
    public CartItemResponse() {}
    
    public CartItemResponse(Long id, Long productId, Long userId, Integer quantity, 
                           BigDecimal price, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.productId = productId;
        this.userId = userId;
        this.quantity = quantity;
        this.price = price;
        this.subtotal = price.multiply(BigDecimal.valueOf(quantity));
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
    
    // Getters and setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Long getProductId() {
        return productId;
    }
    
    public void setProductId(Long productId) {
        this.productId = productId;
    }
    
    public Long getUserId() {
        return userId;
    }
    
    public void setUserId(Long userId) {
        this.userId = userId;
    }
    
    public Integer getQuantity() {
        return quantity;
    }
    
    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
        // Recalculate subtotal when quantity changes
        if (this.price != null && quantity != null) {
            this.subtotal = this.price.multiply(BigDecimal.valueOf(quantity));
        }
    }
    
    public BigDecimal getPrice() {
        return price;
    }
    
    public void setPrice(BigDecimal price) {
        this.price = price;
        // Recalculate subtotal when price changes
        if (price != null && this.quantity != null) {
            this.subtotal = price.multiply(BigDecimal.valueOf(this.quantity));
        }
    }
    
    public BigDecimal getSubtotal() {
        return subtotal;
    }
    
    public void setSubtotal(BigDecimal subtotal) {
        this.subtotal = subtotal;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
    
    public String getProductName() {
        return productName;
    }
    
    public void setProductName(String productName) {
        this.productName = productName;
    }
    
    public String getProductImage() {
        return productImage;
    }
    
    public void setProductImage(String productImage) {
        this.productImage = productImage;
    }
    
    public String getProductCategory() {
        return productCategory;
    }
    
    public void setProductCategory(String productCategory) {
        this.productCategory = productCategory;
    }
    
    public boolean isProductAvailable() {
        return productAvailable;
    }
    
    public void setProductAvailable(boolean productAvailable) {
        this.productAvailable = productAvailable;
    }
}