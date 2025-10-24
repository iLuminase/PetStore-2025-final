package com.cart_api.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public class UpdateCartItemRequest {
    
    @NotNull(message = "Quantity is required")
    @Positive(message = "Quantity must be positive")
    private Integer quantity;
    
    // Constructors
    public UpdateCartItemRequest() {}
    
    public UpdateCartItemRequest(Integer quantity) {
        this.quantity = quantity;
    }
    
    // Getters and setters
    public Integer getQuantity() {
        return quantity;
    }
    
    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }
}