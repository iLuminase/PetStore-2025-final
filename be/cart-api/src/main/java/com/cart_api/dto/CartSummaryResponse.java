package com.cart_api.dto;

import java.math.BigDecimal;
import java.util.List;

public class CartSummaryResponse {
    
    private Long userId;
    private List<CartItemResponse> items;
    private Integer totalItems;
    private Integer totalQuantity;
    private BigDecimal totalAmount;
    private BigDecimal subtotal;
    private BigDecimal tax;
    private BigDecimal shipping;
    
    // Constructors
    public CartSummaryResponse() {}
    
    public CartSummaryResponse(Long userId, List<CartItemResponse> items) {
        this.userId = userId;
        this.items = items;
        this.totalItems = items.size();
        
        // Calculate totals
        this.totalQuantity = items.stream()
            .mapToInt(CartItemResponse::getQuantity)
            .sum();
            
        this.subtotal = items.stream()
            .map(CartItemResponse::getSubtotal)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
            
        // For now, no tax or shipping
        this.tax = BigDecimal.ZERO;
        this.shipping = BigDecimal.ZERO;
        this.totalAmount = subtotal.add(tax).add(shipping);
    }
    
    // Getters and setters
    public Long getUserId() {
        return userId;
    }
    
    public void setUserId(Long userId) {
        this.userId = userId;
    }
    
    public List<CartItemResponse> getItems() {
        return items;
    }
    
    public void setItems(List<CartItemResponse> items) {
        this.items = items;
    }
    
    public Integer getTotalItems() {
        return totalItems;
    }
    
    public void setTotalItems(Integer totalItems) {
        this.totalItems = totalItems;
    }
    
    public Integer getTotalQuantity() {
        return totalQuantity;
    }
    
    public void setTotalQuantity(Integer totalQuantity) {
        this.totalQuantity = totalQuantity;
    }
    
    public BigDecimal getTotalAmount() {
        return totalAmount;
    }
    
    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }
    
    public BigDecimal getSubtotal() {
        return subtotal;
    }
    
    public void setSubtotal(BigDecimal subtotal) {
        this.subtotal = subtotal;
    }
    
    public BigDecimal getTax() {
        return tax;
    }
    
    public void setTax(BigDecimal tax) {
        this.tax = tax;
    }
    
    public BigDecimal getShipping() {
        return shipping;
    }
    
    public void setShipping(BigDecimal shipping) {
        this.shipping = shipping;
    }
}