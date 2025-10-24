package com.auth_api.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.auth_api.dto.GoogleAuthRequest;
import com.auth_api.dto.LoginRequest;
import com.auth_api.dto.RefreshTokenRequest;
import com.auth_api.dto.TokenResponse;
import com.auth_api.service.AuthService;
import com.auth_api.service.GoogleOAuthService;
import com.auth_api.service.JwtService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "*")
public class AuthController {
    
    @Autowired
    private AuthService authService;
    
    @Autowired
    private JwtService jwtService;
    
    @Autowired
    private GoogleOAuthService googleOAuthService;
    
    @PostMapping("/login")
    public ResponseEntity<TokenResponse> login(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            TokenResponse tokenResponse = authService.login(loginRequest);
            return ResponseEntity.ok(tokenResponse);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PostMapping("/refresh")
    public ResponseEntity<TokenResponse> refreshToken(@Valid @RequestBody RefreshTokenRequest refreshRequest) {
        try {
            TokenResponse tokenResponse = authService.refreshToken(refreshRequest);
            return ResponseEntity.ok(tokenResponse);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@Valid @RequestBody RefreshTokenRequest refreshRequest) {
        try {
            authService.logout(refreshRequest.getRefreshToken());
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/validate")
    public ResponseEntity<Map<String, Object>> validateToken(@RequestHeader("Authorization") String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.badRequest().body(Map.of("valid", false, "error", "Invalid Authorization header"));
            }
            
            String token = authHeader.substring(7);
            boolean isValid = authService.validateAccessToken(token);
            
            if (isValid) {
                return ResponseEntity.ok(Map.of(
                    "valid", true,
                    "sub", jwtService.extractUsername(token),
                    "email", jwtService.extractEmail(token),
                    "roles", jwtService.extractRoles(token),
                    "permissions", jwtService.extractPermissions(token),
                    "token_type", jwtService.extractTokenType(token)
                ));
            } else {
                return ResponseEntity.ok(Map.of("valid", false));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("valid", false, "error", e.getMessage()));
        }
    }

    @GetMapping("/decode-token")
    public ResponseEntity<?> decodeToken(@RequestHeader("Authorization") String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.badRequest().body("Invalid Authorization header");
            }
            
            String token = authHeader.substring(7);
            
            return ResponseEntity.ok(Map.of(
                "sub", jwtService.extractUsername(token),
                "email", jwtService.extractEmail(token),
                "roles", jwtService.extractRoles(token),
                "permissions", jwtService.extractPermissions(token),
                "token_type", jwtService.extractTokenType(token),
                "valid", jwtService.validateToken(token),
                "is_access_token", jwtService.isAccessToken(token),
                "is_refresh_token", jwtService.isRefreshToken(token)
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error decoding token: " + e.getMessage());
        }
    }

    @GetMapping("/test")
    public ResponseEntity<?> test() {
        return ResponseEntity.ok("Auth API is running on port 8090!");
    }

    // Google OAuth endpoints
    @GetMapping("/google/url")
    public ResponseEntity<Map<String, String>> getGoogleAuthUrl() {
        try {
            String authUrl = googleOAuthService.getAuthorizationUrl();
            return ResponseEntity.ok(Map.of("authUrl", authUrl));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/google/callback")
    public ResponseEntity<?> googleCallback(@RequestBody GoogleAuthRequest request) {
        try {
            return googleOAuthService.exchangeCodeForToken(request.getCode())
                .flatMap(tokenResponse -> 
                    googleOAuthService.getUserInfo(tokenResponse.getAccessToken())
                        .map(userInfo -> {
                            try {
                                // Create or get user and generate JWT
                                TokenResponse jwtTokens = authService.processGoogleUser(userInfo);
                                return ResponseEntity.ok(jwtTokens);
                            } catch (Exception e) {
                                return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
                            }
                        })
                )
                .block();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}