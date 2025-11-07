package com.product_api.dto;

public class ProductStatusUpdateDTO {
    private Boolean active;
    
    public ProductStatusUpdateDTO() {
    }
    
    public ProductStatusUpdateDTO(Boolean active) {
        this.active = active;
    }
    
    public Boolean getActive() {
        return active;
    }
    
    public void setActive(Boolean active) {
        this.active = active;
    }
}