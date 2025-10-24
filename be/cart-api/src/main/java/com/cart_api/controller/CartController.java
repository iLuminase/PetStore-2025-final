package com.cart_api.controller;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.cart_api.dto.AddToCartRequest;
import com.cart_api.dto.CartItemResponse;
import com.cart_api.dto.CartSummaryResponse;
import com.cart_api.dto.UpdateCartItemRequest;
import com.cart_api.service.CartService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/carts")
@CrossOrigin(origins = "*")
public class CartController {
    
    @Autowired
    private CartService cartService;
    
    // Get user's cart
    @GetMapping
    public ResponseEntity<CartSummaryResponse> getCart(Authentication authentication) {
        Long userId = getUserIdFromAuthentication(authentication);
        CartSummaryResponse cart = cartService.getCartByUserId(userId);
        return ResponseEntity.ok(cart);
    }
    
    // Add product to cart
    @PostMapping("/add")
    public ResponseEntity<CartItemResponse> addToCart(
            Authentication authentication,
            @Valid @RequestBody AddToCartRequest request) {
        try {
            Long userId = getUserIdFromAuthentication(authentication);
            CartItemResponse cartItem = cartService.addToCart(userId, request);
            return ResponseEntity.status(HttpStatus.CREATED).body(cartItem);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
    
    // Update cart item quantity
    @PutMapping("/product/{productId}")
    public ResponseEntity<CartItemResponse> updateCartItem(
            Authentication authentication,
            @PathVariable Long productId,
            @Valid @RequestBody UpdateCartItemRequest request) {
        try {
            Long userId = getUserIdFromAuthentication(authentication);
            CartItemResponse updatedItem = cartService.updateCartItem(userId, productId, request);
            return ResponseEntity.ok(updatedItem);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
    
    // Remove product from cart
    @DeleteMapping("/product/{productId}")
    public ResponseEntity<Void> removeFromCart(
            Authentication authentication,
            @PathVariable Long productId) {
        try {
            Long userId = getUserIdFromAuthentication(authentication);
            cartService.removeFromCart(userId, productId);
            return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // Clear entire cart
    @DeleteMapping("/clear")
    public ResponseEntity<Void> clearCart(Authentication authentication) {
        try {
            Long userId = getUserIdFromAuthentication(authentication);
            cartService.clearCart(userId);
            return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // Get specific cart item
    @GetMapping("/product/{productId}")
    public ResponseEntity<CartItemResponse> getCartItem(
            Authentication authentication,
            @PathVariable Long productId) {
        try {
            Long userId = getUserIdFromAuthentication(authentication);
            CartItemResponse cartItem = cartService.getCartItem(userId, productId);
            return ResponseEntity.ok(cartItem);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // Check if product is in cart
    @GetMapping("/product/{productId}/exists")
    public ResponseEntity<Map<String, Boolean>> isProductInCart(
            Authentication authentication,
            @PathVariable Long productId) {
        try {
            Long userId = getUserIdFromAuthentication(authentication);
            boolean exists = cartService.isProductInCart(userId, productId);
            return ResponseEntity.ok(Map.of("exists", exists));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // Get cart item count
    @GetMapping("/count")
    public ResponseEntity<Map<String, Integer>> getCartItemCount(Authentication authentication) {
        try {
            Long userId = getUserIdFromAuthentication(authentication);
            Integer count = cartService.getCartItemCount(userId);
            return ResponseEntity.ok(Map.of("count", count != null ? count : 0));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // Get cart total
    @GetMapping("/total")
    public ResponseEntity<Map<String, BigDecimal>> getCartTotal(Authentication authentication) {
        try {
            Long userId = getUserIdFromAuthentication(authentication);
            BigDecimal total = cartService.getCartTotal(userId);
            return ResponseEntity.ok(Map.of("total", total != null ? total : BigDecimal.ZERO));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // Bulk operations
    
    // Add multiple items to cart
    @PostMapping("/add-multiple")
    public ResponseEntity<List<CartItemResponse>> addMultipleItems(
            Authentication authentication,
            @Valid @RequestBody List<AddToCartRequest> requests) {
        try {
            Long userId = getUserIdFromAuthentication(authentication);
            List<CartItemResponse> cartItems = cartService.addMultipleItems(userId, requests);
            return ResponseEntity.status(HttpStatus.CREATED).body(cartItems);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
    
    // Remove multiple items from cart
    @DeleteMapping("/remove-multiple")
    public ResponseEntity<Void> removeMultipleItems(
            Authentication authentication,
            @RequestBody List<Long> productIds) {
        try {
            Long userId = getUserIdFromAuthentication(authentication);
            cartService.removeMultipleItems(userId, productIds);
            return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // Increase item quantity
    @PutMapping("/product/{productId}/increase")
    public ResponseEntity<CartItemResponse> increaseQuantity(
            Authentication authentication,
            @PathVariable Long productId,
            @RequestBody(required = false) Map<String, Integer> quantityMap) {
        try {
            Long userId = getUserIdFromAuthentication(authentication);
            
            // Get current item
            CartItemResponse currentItem = cartService.getCartItem(userId, productId);
            
            // Determine increase amount (default 1)
            Integer increaseBy = (quantityMap != null && quantityMap.containsKey("quantity")) 
                ? quantityMap.get("quantity") : 1;
            
            // Update with new quantity
            UpdateCartItemRequest request = new UpdateCartItemRequest(currentItem.getQuantity() + increaseBy);
            CartItemResponse updatedItem = cartService.updateCartItem(userId, productId, request);
            
            return ResponseEntity.ok(updatedItem);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
    
    // Decrease item quantity
    @PutMapping("/product/{productId}/decrease")
    public ResponseEntity<CartItemResponse> decreaseQuantity(
            Authentication authentication,
            @PathVariable Long productId,
            @RequestBody(required = false) Map<String, Integer> quantityMap) {
        try {
            Long userId = getUserIdFromAuthentication(authentication);
            
            // Get current item
            CartItemResponse currentItem = cartService.getCartItem(userId, productId);
            
            // Determine decrease amount (default 1)
            Integer decreaseBy = (quantityMap != null && quantityMap.containsKey("quantity")) 
                ? quantityMap.get("quantity") : 1;
            
            Integer newQuantity = currentItem.getQuantity() - decreaseBy;
            
            // If quantity becomes 0 or negative, remove item
            if (newQuantity <= 0) {
                cartService.removeFromCart(userId, productId);
                return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
            }
            
            // Update with new quantity
            UpdateCartItemRequest request = new UpdateCartItemRequest(newQuantity);
            CartItemResponse updatedItem = cartService.updateCartItem(userId, productId, request);
            
            return ResponseEntity.ok(updatedItem);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
    
    // Helper method to extract user ID from JWT token
    private Long getUserIdFromAuthentication(Authentication authentication) {
        if (authentication != null && authentication.getPrincipal() instanceof Jwt jwt) {
            // Extract user ID from JWT subject (UUID string)
            String userIdStr = jwt.getSubject();
            if (userIdStr != null && !userIdStr.isEmpty()) {
                try {
                    return Long.parseLong(userIdStr);
                } catch (NumberFormatException e) {
                    throw new RuntimeException("Invalid user ID format in JWT");
                }
            }
            
            // Try custom claim if subject is not available
            String userIdClaim = jwt.getClaimAsString("userId");
            if (userIdClaim != null) {
                try {
                    return Long.parseLong(userIdClaim);
                } catch (NumberFormatException e) {
                    throw new RuntimeException("Invalid user ID format in JWT claim");
                }
            }
        }
        throw new RuntimeException("Unable to extract user ID from authentication");
    }
}