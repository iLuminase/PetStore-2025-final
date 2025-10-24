package com.auth_api.dto;

public class GoogleAuthRequest {
    private String code;

    public GoogleAuthRequest() {}

    public GoogleAuthRequest(String code) {
        this.code = code;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }
}