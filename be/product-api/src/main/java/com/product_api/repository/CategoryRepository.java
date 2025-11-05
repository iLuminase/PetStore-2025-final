package com.product_api.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.product_api.models.Category;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    
    // Find active categories
    List<Category> findByActiveTrue();
    
    // Find by name
    Optional<Category> findByName(String name);
    
    // Find by name and active
    Optional<Category> findByNameAndActiveTrue(String name);
    
    // Check if category name exists
    boolean existsByName(String name);
    
    // Check if category name exists (excluding current id for updates)
    @Query("SELECT COUNT(c) > 0 FROM Category c WHERE c.name = :name AND c.id != :id")
    boolean existsByNameAndIdNot(String name, Long id);
}