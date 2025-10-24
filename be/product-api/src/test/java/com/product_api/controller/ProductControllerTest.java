package com.product_api.controller;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.product_api.dto.ProductCreateDTO;
import com.product_api.dto.ProductResponseDTO;
import com.product_api.service.ProductService;

@WebMvcTest(ProductController.class)
public class ProductControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ProductService productService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    public void testCreateProduct() throws Exception {
        ProductCreateDTO createDTO = new ProductCreateDTO();
        createDTO.setName("Test Product");
        createDTO.setDescription("Test Description");
        createDTO.setPrice(new BigDecimal("29.99"));
        createDTO.setStockQuantity(100);
        createDTO.setCategory("Electronics");
        createDTO.setBrand("TestBrand");

        ProductResponseDTO responseDTO = new ProductResponseDTO();
        responseDTO.setId(1L);
        responseDTO.setName("Test Product");
        responseDTO.setDescription("Test Description");
        responseDTO.setPrice(new BigDecimal("29.99"));
        responseDTO.setStockQuantity(100);
        responseDTO.setCategory("Electronics");
        responseDTO.setBrand("TestBrand");
        responseDTO.setActive(true);
        responseDTO.setCreatedAt(LocalDateTime.now());
        responseDTO.setUpdatedAt(LocalDateTime.now());

        when(productService.createProduct(any(ProductCreateDTO.class))).thenReturn(responseDTO);

        mockMvc.perform(post("/api/products")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createDTO)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Test Product"))
                .andExpect(jsonPath("$.price").value(29.99));
    }

    @Test
    public void testGetProductById() throws Exception {
        ProductResponseDTO responseDTO = new ProductResponseDTO();
        responseDTO.setId(1L);
        responseDTO.setName("Test Product");
        responseDTO.setDescription("Test Description");
        responseDTO.setPrice(new BigDecimal("29.99"));
        responseDTO.setStockQuantity(100);
        responseDTO.setCategory("Electronics");
        responseDTO.setBrand("TestBrand");
        responseDTO.setActive(true);
        responseDTO.setCreatedAt(LocalDateTime.now());
        responseDTO.setUpdatedAt(LocalDateTime.now());

        when(productService.getProductById(anyLong())).thenReturn(responseDTO);

        mockMvc.perform(get("/api/products/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("Test Product"));
    }

    @Test
    public void testGetActiveProducts() throws Exception {
        ProductResponseDTO product1 = new ProductResponseDTO();
        product1.setId(1L);
        product1.setName("Product 1");
        product1.setActive(true);

        ProductResponseDTO product2 = new ProductResponseDTO();
        product2.setId(2L);
        product2.setName("Product 2");
        product2.setActive(true);

        List<ProductResponseDTO> products = Arrays.asList(product1, product2);

        when(productService.getActiveProducts()).thenReturn(products);

        mockMvc.perform(get("/api/products/active"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].name").value("Product 1"))
                .andExpect(jsonPath("$[1].name").value("Product 2"));
    }
}