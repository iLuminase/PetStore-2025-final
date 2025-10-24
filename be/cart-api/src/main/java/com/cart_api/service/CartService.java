package com.cart_api.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cart_api.dto.AddToCartRequest;
import com.cart_api.dto.CartItemResponse;
import com.cart_api.dto.CartSummaryResponse;
import com.cart_api.dto.UpdateCartItemRequest;
import com.cart_api.models.CartItem;
import com.cart_api.repository.CartItemRepository;

@Service
@Transactional
public class CartService {
    
    @Autowired
    private CartItemRepository cartItemRepository;
    
    public CartSummaryResponse getCartByUserId(Long userId) {
        List<CartItem> cartItems = cartItemRepository.findByUserId(userId);
        List<CartItemResponse> cartItemResponses = cartItems.stream()
            .map(this::mapToCartItemResponse)
            .collect(Collectors.toList());
        
        return new CartSummaryResponse(userId, cartItemResponses);
    }
    
    public CartItemResponse addToCart(Long userId, AddToCartRequest request) {
        // Check if item already exists in cart
        Optional<CartItem> existingItem = cartItemRepository.findByUserIdAndProductId(userId, request.getProductId());
        
        CartItem cartItem;
        if (existingItem.isPresent()) {
            // Update existing item quantity
            cartItem = existingItem.get();
            cartItem.setQuantity(cartItem.getQuantity() + request.getQuantity());
            cartItem.setUpdatedAt(LocalDateTime.now());
        } else {
            // Create new cart item
            cartItem = new CartItem();
            cartItem.setUserId(userId);
            cartItem.setProductId(request.getProductId());
            cartItem.setQuantity(request.getQuantity());
            cartItem.setPrice(request.getPrice());
            cartItem.setCreatedAt(LocalDateTime.now());
            cartItem.setUpdatedAt(LocalDateTime.now());
        }
        
        cartItem = cartItemRepository.save(cartItem);
        return mapToCartItemResponse(cartItem);
    }
    
    public CartItemResponse updateCartItem(Long userId, Long productId, UpdateCartItemRequest request) {
        CartItem cartItem = cartItemRepository.findByUserIdAndProductId(userId, productId)
            .orElseThrow(() -> new RuntimeException("Cart item not found for user " + userId + " and product " + productId));
        
        cartItem.setQuantity(request.getQuantity());
        cartItem.setUpdatedAt(LocalDateTime.now());
        
        cartItem = cartItemRepository.save(cartItem);
        return mapToCartItemResponse(cartItem);
    }
    
    public void removeFromCart(Long userId, Long productId) {
        if (!cartItemRepository.existsByUserIdAndProductId(userId, productId)) {
            throw new RuntimeException("Cart item not found for user " + userId + " and product " + productId);
        }
        cartItemRepository.deleteByUserIdAndProductId(userId, productId);
    }
    
    public void clearCart(Long userId) {
        cartItemRepository.deleteByUserId(userId);
    }
    
    public CartItemResponse getCartItem(Long userId, Long productId) {
        CartItem cartItem = cartItemRepository.findByUserIdAndProductId(userId, productId)
            .orElseThrow(() -> new RuntimeException("Cart item not found for user " + userId + " and product " + productId));
        
        return mapToCartItemResponse(cartItem);
    }
    
    public boolean isProductInCart(Long userId, Long productId) {
        return cartItemRepository.existsByUserIdAndProductId(userId, productId);
    }
    
    public Integer getCartItemCount(Long userId) {
        return cartItemRepository.getTotalCartQuantity(userId);
    }
    
    public BigDecimal getCartTotal(Long userId) {
        return cartItemRepository.calculateTotalCartValue(userId);
    }
    
    // Helper method to map CartItem to CartItemResponse
    private CartItemResponse mapToCartItemResponse(CartItem cartItem) {
        CartItemResponse response = new CartItemResponse();
        response.setId(cartItem.getId());
        response.setProductId(cartItem.getProductId());
        response.setUserId(cartItem.getUserId());
        response.setQuantity(cartItem.getQuantity());
        response.setPrice(cartItem.getPrice());
        response.setSubtotal(cartItem.getPrice().multiply(BigDecimal.valueOf(cartItem.getQuantity())));
        response.setCreatedAt(cartItem.getCreatedAt());
        response.setUpdatedAt(cartItem.getUpdatedAt());
        
        return response;
    }
    
    // Bulk operations
    public void removeMultipleItems(Long userId, List<Long> productIds) {
        for (Long productId : productIds) {
            cartItemRepository.deleteByUserIdAndProductId(userId, productId);
        }
    }
    
    public List<CartItemResponse> addMultipleItems(Long userId, List<AddToCartRequest> requests) {
        return requests.stream()
            .map(request -> addToCart(userId, request))
            .collect(Collectors.toList());
    }
}