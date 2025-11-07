package com.product_api.service;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.product_api.dto.ProductCreateDTO;
import com.product_api.dto.ProductResponseDTO;
import com.product_api.dto.ProductUpdateDTO;
import com.product_api.exception.InsufficientStockException;
import com.product_api.exception.ProductNotFoundException;
import com.product_api.models.Product;
import com.product_api.repository.ProductRepository;

@Service
@Transactional
public class ProductServiceImpl implements ProductService {
    
    @Autowired
    private ProductRepository productRepository;
    
    @Override
    public ProductResponseDTO createProduct(ProductCreateDTO productCreateDTO) {
        Product product = convertToEntity(productCreateDTO);
        Product savedProduct = productRepository.save(product);
        return convertToResponseDTO(savedProduct);
    }
    
    @Override
    @Transactional(readOnly = true)
    public ProductResponseDTO getProductById(Long id) {
        Product product = productRepository.findByIdAndActiveTrue(id)
                .orElseThrow(() -> new ProductNotFoundException("Product not found with id: " + id));
        return convertToResponseDTO(product);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<ProductResponseDTO> getAllProducts() {
        List<Product> products = productRepository.findAll();
        return products.stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public Page<ProductResponseDTO> getAllProducts(Pageable pageable) {
        Page<Product> products = productRepository.findAll(pageable);
        return products.map(this::convertToResponseDTO);
    }
    
    @Override
    public ProductResponseDTO updateProduct(Long id, ProductUpdateDTO productUpdateDTO) {
        Product existingProduct = productRepository.findById(id)
                .orElseThrow(() -> new ProductNotFoundException("Product not found with id: " + id));
        
        updateProductFields(existingProduct, productUpdateDTO);
        Product updatedProduct = productRepository.save(existingProduct);
        return convertToResponseDTO(updatedProduct);
    }
    
    @Override
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ProductNotFoundException("Product not found with id: " + id));
        
        // Soft delete by setting active to false
        product.setActive(false);
        productRepository.save(product);
    }
    
    @Override
    public void updateProductStatus(Long id, Boolean active) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ProductNotFoundException("Product not found with id: " + id));
        
        // Update active status
        product.setActive(active);
        productRepository.save(product);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<ProductResponseDTO> getActiveProducts() {
        List<Product> products = productRepository.findByActiveTrue();
        return products.stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<ProductResponseDTO> searchProductsByName(String name) {
        List<Product> products = productRepository.findByNameContainingIgnoreCase(name);
        return products.stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ProductResponseDTO> searchProductsWithFilters(String name, String category, String brand, Pageable pageable) {
        Page<Product> products = productRepository.findProductsWithFilters(name, category, brand, pageable);
        return products.map(this::convertToResponseDTO);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Page<ProductResponseDTO> searchActiveProductsWithFilters(String name, String category, String brand, Pageable pageable) {
        Page<Product> products = productRepository.findActiveProductsWithFilters(name, category, brand, pageable);
        return products.map(this::convertToResponseDTO);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<ProductResponseDTO> getProductsByCategory(String category) {
        // Note: This method expects category name as string, but DB has categoryId
        // For now, commenting out until category table relationship is established
        // List<Product> products = productRepository.findByCategoryAndActiveTrue(category);
        List<Product> products = productRepository.findByActiveTrue(); // Temporary fallback
        return products.stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public Page<ProductResponseDTO> getProductsByCategory(String category, Pageable pageable) {
        // Note: This method expects category name as string, but DB has categoryId
        // For now, commenting out until category table relationship is established
        // Page<Product> products = productRepository.findByCategoryAndActiveTrue(category, pageable);
        Page<Product> products = productRepository.findAll(pageable); // Temporary fallback
        return products.map(this::convertToResponseDTO);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<ProductResponseDTO> getProductsByBrand(String brand) {
        List<Product> products = productRepository.findByBrandAndActiveTrue(brand);
        return products.stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<ProductResponseDTO> getProductsByPriceRange(BigDecimal minPrice, BigDecimal maxPrice) {
        List<Product> products = productRepository.findByPriceBetweenAndActiveTrue(minPrice, maxPrice);
        return products.stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<ProductResponseDTO> getAvailableProducts() {
        List<Product> products = productRepository.findAvailableProducts();
        return products.stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public Page<ProductResponseDTO> searchProducts(String searchTerm, Pageable pageable) {
        Page<Product> products = productRepository.searchProducts(searchTerm, pageable);
        return products.map(this::convertToResponseDTO);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<ProductResponseDTO> getLowStockProducts(Integer threshold) {
        List<Product> products = productRepository.findLowStockProducts(threshold);
        return products.stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<String> getAllCategories() {
        return productRepository.findDistinctCategoryNames();
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<String> getAllBrands() {
        return productRepository.findDistinctBrands();
    }
    
    @Override
    public void updateStock(Long productId, Integer quantity) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ProductNotFoundException("Product not found with id: " + productId));
        
        product.setStockQuantity(quantity);
        productRepository.save(product);
    }
    
    @Override
    public void increaseStock(Long productId, Integer quantity) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ProductNotFoundException("Product not found with id: " + productId));
        
        product.setStockQuantity(product.getStockQuantity() + quantity);
        productRepository.save(product);
    }
    
    @Override
    public void decreaseStock(Long productId, Integer quantity) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ProductNotFoundException("Product not found with id: " + productId));
        
        if (product.getStockQuantity() < quantity) {
            throw new InsufficientStockException("Insufficient stock. Available: " + product.getStockQuantity() + ", Requested: " + quantity);
        }
        
        product.setStockQuantity(product.getStockQuantity() - quantity);
        productRepository.save(product);
    }
    
    @Override
    @Transactional(readOnly = true)
    public boolean isProductAvailable(Long productId, Integer requestedQuantity) {
        Product product = productRepository.findByIdAndActiveTrue(productId)
                .orElse(null);
        
        return product != null && product.getStockQuantity() >= requestedQuantity;
    }
    
    // Image operations
    @Override
    public void saveProductImage(Long productId, byte[] imageData, String imageType) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ProductNotFoundException("Product not found with id: " + productId));
        
        product.setImageData(imageData);
        product.setImageType(imageType);
        productRepository.save(product);
    }
    
    @Override
    @Transactional(readOnly = true)
    public byte[] getProductImage(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ProductNotFoundException("Product not found with id: " + productId));
        
        return product.getImageData();
    }
    
    @Override
    @Transactional(readOnly = true)
    public String getProductImageType(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ProductNotFoundException("Product not found with id: " + productId));
        
        return product.getImageType();
    }
    
    @Override
    public void deleteProductImage(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ProductNotFoundException("Product not found with id: " + productId));
        
        product.setImageData(null);
        product.setImageType(null);
        productRepository.save(product);
    }
    
    // Helper methods
    private Product convertToEntity(ProductCreateDTO dto) {
        Product product = new Product();
        product.setName(dto.getName());
        product.setDescription(dto.getDescription());
        product.setPrice(dto.getPrice());
        product.setStockQuantity(dto.getStockQuantity());
        // Note: DTO expects category name (String) but DB has categoryId (Long)
        // For now, skip category mapping until Category table relationship is established
        // TODO: Implement category name -> categoryId mapping
        // Skip brand for now as well
        product.setImageUrl(dto.getImageUrl());
        return product;
    }
    
    private ProductResponseDTO convertToResponseDTO(Product product) {
        // If imageUrl is not set but imageData exists, use image endpoint
        String effectiveImageUrl = product.getImageUrl();
        if ((effectiveImageUrl == null || effectiveImageUrl.isEmpty()) && 
            product.getImageData() != null && product.getImageData().length > 0) {
            effectiveImageUrl = "/api/products/" + product.getId() + "/image";
        }
        
        // Get category name if available
        String categoryName = null;
        if (product.getCategory() != null) {
            categoryName = product.getCategory().getName();
        }
        
        return new ProductResponseDTO(
                product.getId(),
                product.getName(),
                product.getDescription(),
                product.getPrice(),
                product.getStockQuantity(),
                categoryName,
                product.getBrand(),
                effectiveImageUrl,
                product.getActive(),
                product.getCreatedAt(),
                product.getUpdatedAt()
        );
    }
    
    private void updateProductFields(Product product, ProductUpdateDTO dto) {
        if (dto.getName() != null) {
            product.setName(dto.getName());
        }
        if (dto.getDescription() != null) {
            product.setDescription(dto.getDescription());
        }
        if (dto.getPrice() != null) {
            product.setPrice(dto.getPrice());
        }
        if (dto.getStockQuantity() != null) {
            product.setStockQuantity(dto.getStockQuantity());
        }
        // Note: DTO expects category name (String) but DB has categoryId (Long)
        // Category mapping skipped until Category table relationship is established
        if (dto.getBrand() != null) {
            product.setBrand(dto.getBrand());
        }
        if (dto.getImageUrl() != null) {
            product.setImageUrl(dto.getImageUrl());
        }
        if (dto.getActive() != null) {
            product.setActive(dto.getActive());
        }
    }
}