package com.product_api.controller;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.product_api.dto.ProductCreateDTO;
import com.product_api.dto.ProductResponseDTO;
import com.product_api.dto.ProductStatusUpdateDTO;
import com.product_api.dto.ProductUpdateDTO;
import com.product_api.service.ProductService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "*")
public class ProductController {
    
    @Autowired
    private ProductService productService;
    
    // Create a new product
    @PostMapping
    public ResponseEntity<ProductResponseDTO> createProduct(@Valid @RequestBody ProductCreateDTO productCreateDTO) {
        try {
            ProductResponseDTO createdProduct = productService.createProduct(productCreateDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdProduct);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // Get product by ID
    @GetMapping("/{id}")
    public ResponseEntity<ProductResponseDTO> getProductById(@PathVariable Long id) {
        ProductResponseDTO product = productService.getProductById(id);
        return ResponseEntity.ok(product);
    }
    
    // Get all products with pagination and optional filters
    @GetMapping
    public ResponseEntity<Page<ProductResponseDTO>> getAllProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String brand,
            @RequestParam(required = false, defaultValue = "false") boolean includeInactive) {
        try {
            // DEBUG: Log all parameters
            System.out.println("=== getAllProducts called ===");
            System.out.println("name: " + name);
            System.out.println("category: " + category);
            System.out.println("brand: " + brand);
            System.out.println("includeInactive: " + includeInactive);
            System.out.println("page: " + page + ", size: " + size);
            
            // Validate pagination parameters
            if (page < 0) page = 0;
            if (size < 1 || size > 100) size = 10;
            
            Sort sort = sortDir.equalsIgnoreCase("desc") ? 
                Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
            Pageable pageable = PageRequest.of(page, size, sort);
            
            Page<ProductResponseDTO> products;
            
            // Check if any filters are provided
            if (name != null || category != null || brand != null) {
                // Use appropriate filter method based on includeInactive flag
                if (includeInactive) {
                    products = productService.searchProductsWithFilters(name, category, brand, pageable);
                    System.out.println("Admin searched products with filters - name: " + name + ", category: " + category + ", brand: " + brand);
                } else {
                    products = productService.searchActiveProductsWithFilters(name, category, brand, pageable);
                    System.out.println("User searched active products with filters - name: " + name + ", category: " + category + ", brand: " + brand);
                }
            } else {
                products = productService.getAllProducts(pageable);
            }
            
            // Log for debugging
            System.out.println("Loaded " + products.getContent().size() + " products, page " + page);
            
            return ResponseEntity.ok(products);
        } catch (Exception e) {
            System.err.println("Error loading products: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // Get all active products
    @GetMapping("/active")
    public ResponseEntity<List<ProductResponseDTO>> getActiveProducts() {
        try {
            List<ProductResponseDTO> products = productService.getActiveProducts();
            return ResponseEntity.ok(products);
        } catch (Exception e) {
            System.err.println("Error loading active products: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // Debug endpoint
    @GetMapping("/test")
    public ResponseEntity<String> testConnection() {
        try {
            List<ProductResponseDTO> products = productService.getAllProducts();
            return ResponseEntity.ok("Database connected! Product count: " + products.size());
        } catch (Exception e) {
            return ResponseEntity.ok("Database error: " + e.getMessage());
        }
    }
    
    // Test endpoint removed
    
    // Get available products (in stock)
    @GetMapping("/available")
    public ResponseEntity<List<ProductResponseDTO>> getAvailableProducts() {
        try {
            List<ProductResponseDTO> products = productService.getAvailableProducts();
            return ResponseEntity.ok(products);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // Update product
    @PutMapping("/{id}")
    public ResponseEntity<ProductResponseDTO> updateProduct(
            @PathVariable Long id, 
            @Valid @RequestBody ProductUpdateDTO productUpdateDTO) {
        ProductResponseDTO updatedProduct = productService.updateProduct(id, productUpdateDTO);
        return ResponseEntity.ok(updatedProduct);
    }
    
    // Delete product (soft delete)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }
    
    // Update product status (activate/deactivate)
    @PatchMapping("/{id}/status")
    public ResponseEntity<Void> updateProductStatus(@PathVariable Long id, @RequestBody ProductStatusUpdateDTO statusUpdate) {
        try {
            Boolean active = statusUpdate.getActive();
            if (active != null) {
                productService.updateProductStatus(id, active);
                return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
            }
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            e.printStackTrace(); // Add logging để debug
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // Search products by name
    @GetMapping("/search/name")
    public ResponseEntity<List<ProductResponseDTO>> searchProductsByName(@RequestParam String name) {
        try {
            List<ProductResponseDTO> products = productService.searchProductsByName(name);
            return ResponseEntity.ok(products);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // Search products by name or description with pagination
    @GetMapping("/search")
    public ResponseEntity<Page<ProductResponseDTO>> searchProducts(
            @RequestParam String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        try {
            Sort sort = sortDir.equalsIgnoreCase("desc") ? 
                Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
            Pageable pageable = PageRequest.of(page, size, sort);
            
            Page<ProductResponseDTO> products = productService.searchProducts(query, pageable);
            return ResponseEntity.ok(products);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // Get products by category
    @GetMapping("/category/{category}")
    public ResponseEntity<Page<ProductResponseDTO>> getProductsByCategory(
            @PathVariable String category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        try {
            Sort sort = sortDir.equalsIgnoreCase("desc") ? 
                Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
            Pageable pageable = PageRequest.of(page, size, sort);
            
            Page<ProductResponseDTO> products = productService.getProductsByCategory(category, pageable);
            return ResponseEntity.ok(products);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // Get products by brand
    @GetMapping("/brand/{brand}")
    public ResponseEntity<List<ProductResponseDTO>> getProductsByBrand(@PathVariable String brand) {
        try {
            List<ProductResponseDTO> products = productService.getProductsByBrand(brand);
            return ResponseEntity.ok(products);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // Get products by price range
    @GetMapping("/price-range")
    public ResponseEntity<List<ProductResponseDTO>> getProductsByPriceRange(
            @RequestParam BigDecimal minPrice,
            @RequestParam BigDecimal maxPrice) {
        try {
            List<ProductResponseDTO> products = productService.getProductsByPriceRange(minPrice, maxPrice);
            return ResponseEntity.ok(products);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // Get low stock products
    @GetMapping("/low-stock")
    public ResponseEntity<List<ProductResponseDTO>> getLowStockProducts(
            @RequestParam(defaultValue = "10") Integer threshold) {
        try {
            List<ProductResponseDTO> products = productService.getLowStockProducts(threshold);
            return ResponseEntity.ok(products);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // Get all categories
    @GetMapping("/categories")
    public ResponseEntity<List<String>> getAllCategories() {
        try {
            List<String> categories = productService.getAllCategories();
            return ResponseEntity.ok(categories);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // Get all brands
    @GetMapping("/brands")
    public ResponseEntity<List<String>> getAllBrands() {
        try {
            List<String> brands = productService.getAllBrands();
            return ResponseEntity.ok(brands);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // Stock management endpoints
    
    // Update stock quantity
    @PutMapping("/{id}/stock")
    public ResponseEntity<Void> updateStock(
            @PathVariable Long id, 
            @RequestBody Map<String, Integer> stockUpdate) {
        try {
            Integer quantity = stockUpdate.get("quantity");
            if (quantity == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
            }
            productService.updateStock(id, quantity);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // Increase stock
    @PutMapping("/{id}/stock/increase")
    public ResponseEntity<Void> increaseStock(
            @PathVariable Long id, 
            @RequestBody Map<String, Integer> stockUpdate) {
        try {
            Integer quantity = stockUpdate.get("quantity");
            if (quantity == null || quantity <= 0) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
            }
            productService.increaseStock(id, quantity);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // Decrease stock
    @PutMapping("/{id}/stock/decrease")
    public ResponseEntity<Void> decreaseStock(
            @PathVariable Long id, 
            @RequestBody Map<String, Integer> stockUpdate) {
        try {
            Integer quantity = stockUpdate.get("quantity");
            if (quantity == null || quantity <= 0) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
            }
            productService.decreaseStock(id, quantity);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // Check product availability
    @GetMapping("/{id}/availability")
    public ResponseEntity<Map<String, Boolean>> checkProductAvailability(
            @PathVariable Long id,
            @RequestParam Integer quantity) {
        try {
            boolean available = productService.isProductAvailable(id, quantity);
            return ResponseEntity.ok(Map.of("available", available));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // Upload product image
    @PostMapping("/{id}/image")
    public ResponseEntity<Map<String, String>> uploadProductImage(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "File is empty"));
            }
            
            // Validate file type
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "File must be an image"));
            }
            
            // Validate file size (max 5MB)
            if (file.getSize() > 5 * 1024 * 1024) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "File size must not exceed 5MB"));
            }
            
            productService.saveProductImage(id, file.getBytes(), contentType);
            return ResponseEntity.ok(Map.of(
                "message", "Image uploaded successfully",
                "imageUrl", "/api/products/" + id + "/image"
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to upload image: " + e.getMessage()));
        }
    }
    
    // Get product image
    @GetMapping("/{id}/image")
    public ResponseEntity<byte[]> getProductImage(@PathVariable Long id) {
        try {
            byte[] imageData = productService.getProductImage(id);
            String imageType = productService.getProductImageType(id);
            
            if (imageData == null || imageData.length == 0) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }
            
            HttpHeaders headers = new HttpHeaders();
            if (imageType != null && !imageType.isEmpty()) {
                headers.setContentType(MediaType.parseMediaType(imageType));
            } else {
                headers.setContentType(MediaType.IMAGE_JPEG);
            }
            headers.setContentLength(imageData.length);
            headers.setCacheControl("max-age=3600"); // Cache for 1 hour
            
            return new ResponseEntity<>(imageData, headers, HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }
    
    // Delete product image
    @DeleteMapping("/{id}/image")
    public ResponseEntity<Map<String, String>> deleteProductImage(@PathVariable Long id) {
        try {
            productService.deleteProductImage(id);
            return ResponseEntity.ok(Map.of("message", "Image deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to delete image: " + e.getMessage()));
        }
    }
}