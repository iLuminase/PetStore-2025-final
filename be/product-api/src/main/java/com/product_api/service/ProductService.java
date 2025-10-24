package com.product_api.service;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.product_api.dto.ProductCreateDTO;
import com.product_api.dto.ProductResponseDTO;
import com.product_api.dto.ProductUpdateDTO;

public interface ProductService {
    
    // Basic CRUD operations
    ProductResponseDTO createProduct(ProductCreateDTO productCreateDTO);
    
    ProductResponseDTO getProductById(Long id);
    
    List<ProductResponseDTO> getAllProducts();
    
    Page<ProductResponseDTO> getAllProducts(Pageable pageable);
    
    ProductResponseDTO updateProduct(Long id, ProductUpdateDTO productUpdateDTO);
    
    void deleteProduct(Long id);
    
    // Business operations
    List<ProductResponseDTO> getActiveProducts();
    
    List<ProductResponseDTO> searchProductsByName(String name);
    
    List<ProductResponseDTO> getProductsByCategory(String category);
    
    Page<ProductResponseDTO> getProductsByCategory(String category, Pageable pageable);
    
    List<ProductResponseDTO> getProductsByBrand(String brand);
    
    List<ProductResponseDTO> getProductsByPriceRange(BigDecimal minPrice, BigDecimal maxPrice);
    
    List<ProductResponseDTO> getAvailableProducts();
    
    Page<ProductResponseDTO> searchProducts(String searchTerm, Pageable pageable);
    
    List<ProductResponseDTO> getLowStockProducts(Integer threshold);
    
    List<String> getAllCategories();
    
    List<String> getAllBrands();
    
    // Stock management
    void updateStock(Long productId, Integer quantity);
    
    void increaseStock(Long productId, Integer quantity);
    
    void decreaseStock(Long productId, Integer quantity);
    
    boolean isProductAvailable(Long productId, Integer requestedQuantity);
    
    // Image operations
    void saveProductImage(Long productId, byte[] imageData, String imageType);
    
    byte[] getProductImage(Long productId);
    
    String getProductImageType(Long productId);
    
    void deleteProductImage(Long productId);
}