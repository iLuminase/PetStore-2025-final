package com.auth_api.service;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.auth_api.dto.GoogleUserInfo;
import com.auth_api.dto.LoginRequest;
import com.auth_api.dto.RefreshTokenRequest;
import com.auth_api.dto.TokenResponse;
import com.auth_api.entity.User;
import com.auth_api.repository.UserRepository;

@Service
public class AuthService {
    
    @Autowired
    private AuthenticationManager authenticationManager;
    
    @Autowired
    private JwtService jwtService;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Value("${jwt.access-token.expiration}")
    private Long accessTokenExpiration;
    
    public TokenResponse login(LoginRequest loginRequest) {
        try {
            // Authenticate user
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    loginRequest.getUsername(), 
                    loginRequest.getPassword()
                )
            );
            
            // For demo purposes, using mock data
            // TODO: Replace with actual user entity from database
            String userUuid = UUID.randomUUID().toString();
            String email = loginRequest.getUsername().contains("@") ? 
                          loginRequest.getUsername() : 
                          loginRequest.getUsername() + "@petstore.local";
            List<String> roles = Arrays.asList("Admin", "Staff"); // Mock roles
            List<String> permissions = Arrays.asList("Product.Add", "Product.Edit", "Product.Delete", "Product.View"); // Mock permissions
            
            // Generate tokens
            String accessToken = jwtService.generateAccessToken(userUuid, email, roles, permissions);
            String refreshToken = jwtService.generateRefreshToken(userUuid);
            
            return new TokenResponse(
                accessToken,
                refreshToken,
                "Bearer",
                accessTokenExpiration
            );
            
        } catch (BadCredentialsException e) {
            throw new BadCredentialsException("Invalid username or password");
        } catch (Exception e) {
            throw new RuntimeException("Authentication failed", e);
        }
    }
    
    public TokenResponse refreshToken(RefreshTokenRequest refreshTokenRequest) {
        try {
            String refreshToken = refreshTokenRequest.getRefreshToken();
            
            // Validate refresh token
            if (!jwtService.validateRefreshToken(refreshToken)) {
                throw new BadCredentialsException("Invalid refresh token");
            }
            
            // Extract user UUID from refresh token
            String userUuid = jwtService.extractUsername(refreshToken);
            
            // TODO: Get user details from database using userUuid
            // For now, using mock data
            String email = "admin@petstore.local"; // Mock email
            List<String> roles = Arrays.asList("Admin", "Staff"); // Mock roles
            List<String> permissions = Arrays.asList("Product.Add", "Product.Edit", "Product.Delete", "Product.View"); // Mock permissions
            
            // Generate new access token
            String newAccessToken = jwtService.generateAccessToken(userUuid, email, roles, permissions);
            
            return new TokenResponse(
                newAccessToken,
                refreshToken, // Keep the same refresh token
                "Bearer",
                accessTokenExpiration
            );
            
        } catch (Exception e) {
            throw new BadCredentialsException("Token refresh failed");
        }
    }
    
    public void logout(String refreshToken) {
        // TODO: Add refresh token to blacklist/revoked tokens table
        // For now, just validate the token format
        if (!jwtService.validateRefreshToken(refreshToken)) {
            throw new BadCredentialsException("Invalid refresh token");
        }
    }
    
    public boolean validateAccessToken(String token) {
        return jwtService.validateAccessToken(token);
    }
    
    public TokenResponse processGoogleUser(GoogleUserInfo googleUserInfo) {
        try {
            User user;
            String userUuid;
            
            // Check if user exists by Google ID
            Optional<User> existingUser = userRepository.findByGoogleId(googleUserInfo.getId());
            
            if (existingUser.isPresent()) {
                user = existingUser.get();
                userUuid = user.getId().toString();
            } else {
                // Check if user exists by email
                Optional<User> userByEmail = userRepository.findByEmail(googleUserInfo.getEmail());
                
                if (userByEmail.isPresent()) {
                    // Update existing user with Google ID
                    user = userByEmail.get();
                    user.setGoogleId(googleUserInfo.getId());
                    user.setAuthProvider("GOOGLE");
                    user.setProfilePicture(googleUserInfo.getPicture());
                } else {
                    // Create new user
                    user = new User();
                    user.setUsername(googleUserInfo.getEmail());
                    user.setEmail(googleUserInfo.getEmail());
                    user.setPassword(passwordEncoder.encode(UUID.randomUUID().toString())); // Random password
                    user.setGoogleId(googleUserInfo.getId());
                    user.setAuthProvider("GOOGLE");
                    user.setProfilePicture(googleUserInfo.getPicture());
                    user.setRole("USER");
                }
                
                user = userRepository.save(user);
                userUuid = user.getId().toString();
            }
            
            // Generate JWT tokens
            List<String> roles = Arrays.asList(user.getRole());
            List<String> permissions = getPermissionsForRole(user.getRole());
            
            String accessToken = jwtService.generateAccessToken(userUuid, user.getEmail(), roles, permissions);
            String refreshToken = jwtService.generateRefreshToken(userUuid);
            
            return new TokenResponse(
                accessToken,
                refreshToken,
                "Bearer",
                accessTokenExpiration
            );
            
        } catch (Exception e) {
            throw new RuntimeException("Google authentication failed", e);
        }
    }
    
    private List<String> getPermissionsForRole(String role) {
        switch (role.toUpperCase()) {
            case "ADMIN":
                return Arrays.asList("Product.Add", "Product.Edit", "Product.Delete", "Product.View", 
                                   "Cart.Add", "Cart.Edit", "Cart.Delete", "Cart.View");
            case "USER":
            default:
                return Arrays.asList("Product.View", "Cart.Add", "Cart.Edit", "Cart.Delete", "Cart.View");
        }
    }
}