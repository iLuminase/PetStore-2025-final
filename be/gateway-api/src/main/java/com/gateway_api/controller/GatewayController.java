package com.gateway_api.controller;

import java.util.Enumeration;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import com.gateway_api.service.SsoService;

import jakarta.servlet.http.HttpServletRequest;

@RestController
public class GatewayController {

    @Autowired
    private SsoService ssoService;

    @Autowired
    private RestTemplate restTemplate;

    @Value("${product-service.url}")
    private String productServiceUrl;

    @Value("${cart-service.url}")
    private String cartServiceUrl;

    // Forward all authentication requests to auth-service
    @RequestMapping(value = {"/auth/**", "/api/auth/**"}, method = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS})
    public ResponseEntity<String> forwardAuthRequests(
            HttpServletRequest request,
            @RequestBody(required = false) String body) {
        
        // Handle OPTIONS request for CORS preflight
        if ("OPTIONS".equals(request.getMethod())) {
            return ResponseEntity.ok().build();
        }
        
        String path = request.getRequestURI();
        HttpMethod method = HttpMethod.valueOf(request.getMethod());
        
        // Copy headers from original request
        HttpHeaders headers = new HttpHeaders();
        Enumeration<String> headerNames = request.getHeaderNames();
        while (headerNames.hasMoreElements()) {
            String headerName = headerNames.nextElement();
            headers.add(headerName, request.getHeader(headerName));
        }
        
        HttpEntity<String> entity = new HttpEntity<>(body, headers);
        return ssoService.forwardToAuthService(path, method, entity);
    }

    // Product service routes with JWT validation
    @RequestMapping(value = "/api/products/**", method = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE})
    public ResponseEntity<String> forwardProductRequests(
            HttpServletRequest request,
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestBody(required = false) String body) {
        
        // For GET requests (public access), no token validation required
        if ("GET".equals(request.getMethod())) {
            return forwardRequest(request, body, productServiceUrl);
        }
        
        // For other methods, validate token
        ResponseEntity<String> authResult = validateAndRefreshToken(authHeader);
        if (authResult != null) {
            return authResult;
        }
        
        return forwardRequest(request, body, productServiceUrl);
    }

    // Cart service routes with JWT validation
    @RequestMapping(value = "/api/carts/**", method = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE})
    public ResponseEntity<String> forwardCartRequests(
            HttpServletRequest request,
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestBody(required = false) String body) {
        
        // Cart operations require authentication
        ResponseEntity<String> authResult = validateAndRefreshToken(authHeader);
        if (authResult != null) {
            return authResult;
        }
        
        return forwardRequest(request, body, cartServiceUrl);
    }

    // Health check endpoint
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of(
            "status", "UP",
            "service", "gateway-api",
            "message", "Gateway is running with SSO"
        ));
    }

    private ResponseEntity<String> validateAndRefreshToken(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body("{\"error\": \"Authorization header is required\"}");
        }

        String token = authHeader.substring(7);
        
        // Check if token is valid
        if (!ssoService.isTokenValid(token)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body("{\"error\": \"Invalid or expired access token\"}");
        }
        
        return null; // Token is valid
    }

    private ResponseEntity<String> forwardRequest(HttpServletRequest request, String body, String serviceUrl) {
        try {
            String path = request.getRequestURI();
            HttpMethod method = HttpMethod.valueOf(request.getMethod());
            
            // Copy headers from original request
            HttpHeaders headers = new HttpHeaders();
            Enumeration<String> headerNames = request.getHeaderNames();
            while (headerNames.hasMoreElements()) {
                String headerName = headerNames.nextElement();
                if (!"host".equalsIgnoreCase(headerName)) { // Skip host header
                    headers.add(headerName, request.getHeader(headerName));
                }
            }
            
            HttpEntity<String> entity = new HttpEntity<>(body, headers);
            
            // Forward to appropriate service with full path (including /api prefix)
            String targetUrl = serviceUrl + path;
            System.out.println("Forwarding request to: " + targetUrl); // Debug log
            
            return restTemplate.exchange(
                targetUrl,
                method,
                entity,
                String.class
            );
            
        } catch (Exception e) {
            System.err.println("Error forwarding request: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("{\"error\": \"Failed to forward request: " + e.getMessage() + "\"}");
        }
    }
}