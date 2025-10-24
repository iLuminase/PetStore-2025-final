package com.gateway_api.service;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class SsoService {

    @Autowired
    private JwtService jwtService;

    @Autowired
    private RestTemplate restTemplate;

    @Value("${auth-service.url}")
    private String authServiceUrl;

    public boolean isTokenValid(String token) {
        if (token == null || token.isEmpty()) {
            return false;
        }
        
        // Remove Bearer prefix if exists
        if (token.startsWith("Bearer ")) {
            token = token.substring(7);
        }
        
        return jwtService.validateToken(token);
    }

    public boolean isTokenExpired(String token) {
        if (token == null || token.isEmpty()) {
            return true;
        }
        
        // Remove Bearer prefix if exists
        if (token.startsWith("Bearer ")) {
            token = token.substring(7);
        }
        
        try {
            return jwtService.extractExpiration(token).getTime() < System.currentTimeMillis();
        } catch (Exception e) {
            return true;
        }
    }

    public String refreshTokenFromAuthService(String refreshToken) {
        try {
            // Create request to auth service
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            Map<String, String> request = Map.of("refreshToken", refreshToken);
            HttpEntity<Map<String, String>> entity = new HttpEntity<>(request, headers);
            
            // Call auth service refresh endpoint
            ResponseEntity<Map> response = restTemplate.exchange(
                authServiceUrl + "/auth/refresh",
                HttpMethod.POST,
                entity,
                Map.class
            );
            
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                Map<String, Object> responseBody = response.getBody();
                return (String) responseBody.get("accessToken");
            }
            
            return null;
        } catch (Exception e) {
            System.err.println("Error refreshing token: " + e.getMessage());
            return null;
        }
    }

    public ResponseEntity<String> forwardToAuthService(String path, HttpMethod method, HttpEntity<?> entity) {
        try {
            // Strip /api prefix if present (e.g., /api/auth/login -> /auth/login)
            String targetPath = path;
            if (path.startsWith("/api/")) {
                targetPath = path.substring(4); // Remove "/api" prefix
            }
            
            String targetUrl = authServiceUrl + targetPath;
            System.out.println("Forwarding request to: " + targetUrl); // Debug log
            
            return restTemplate.exchange(
                targetUrl,
                method,
                entity,
                String.class
            );
        } catch (Exception e) {
            System.err.println("Error forwarding to auth service: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("{\"error\": \"Failed to forward request to auth service: " + e.getMessage() + "\"}");
        }
    }

    public String extractUserFromToken(String token) {
        if (token == null || token.isEmpty()) {
            return null;
        }
        
        // Remove Bearer prefix if exists
        if (token.startsWith("Bearer ")) {
            token = token.substring(7);
        }
        
        try {
            return jwtService.extractUsername(token);
        } catch (Exception e) {
            return null;
        }
    }

    public String extractRoleFromToken(String token) {
        if (token == null || token.isEmpty()) {
            return null;
        }
        
        // Remove Bearer prefix if exists
        if (token.startsWith("Bearer ")) {
            token = token.substring(7);
        }
        
        try {
            return jwtService.extractRole(token);
        } catch (Exception e) {
            return null;
        }
    }
}