package com.auth_api.service;

import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

@Service
public class JwtService {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.issuer}")
    private String issuer;

    @Value("${jwt.access-token.expiration}")
    private Long accessTokenExpiration;

    @Value("${jwt.refresh-token.expiration}")
    private Long refreshTokenExpiration;

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes());
    }

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public String extractRole(String token) {
        return extractClaim(token, claims -> claims.get("role", String.class));
    }

    public List<String> extractAuthorities(String token) {
        @SuppressWarnings("unchecked")
        List<String> authorities = extractClaim(token, claims -> claims.get("authorities", List.class));
        return authorities;
    }

    public List<String> extractRoles(String token) {
        @SuppressWarnings("unchecked")
        List<String> roles = extractClaim(token, claims -> claims.get("roles", List.class));
        return roles;
    }

    public List<String> extractPermissions(String token) {
        @SuppressWarnings("unchecked")
        List<String> permissions = extractClaim(token, claims -> claims.get("permissions", List.class));
        return permissions;
    }

    public String extractEmail(String token) {
        return extractClaim(token, claims -> claims.get("email", String.class));
    }

    public String extractTokenType(String token) {
        return extractClaim(token, claims -> claims.get("token_type", String.class));
    }

    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private Boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    public String generateAccessToken(String userUuid, String email, List<String> roles, List<String> permissions) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("email", email);
        claims.put("roles", roles);
        claims.put("permissions", permissions);
        claims.put("token_type", "access");
        
        return createToken(claims, userUuid, accessTokenExpiration);
    }

    public String generateRefreshToken(String userUuid) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("token_type", "refresh");
        
        return createToken(claims, userUuid, refreshTokenExpiration);
    }

    // Backward compatibility with existing UserDetails
    public String generateToken(UserDetails userDetails) {
        Map<String, Object> claims = new HashMap<>();
        
        // Add role to claims
        List<String> authorities = userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList());
        
        claims.put("authorities", authorities);
        
        // Extract role (remove ROLE_ prefix if exists)
        String role = authorities.stream()
                .filter(auth -> auth.startsWith("ROLE_"))
                .map(auth -> auth.substring(5)) // Remove "ROLE_" prefix
                .findFirst()
                .orElse("USER");
        
        claims.put("role", role);
        
        return createToken(claims, userDetails.getUsername(), accessTokenExpiration);
    }

    private String createToken(Map<String, Object> claims, String subject, Long expirationTime) {
        return Jwts.builder()
                .claims(claims)
                .subject(subject)
                .issuer(issuer)
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + expirationTime * 1000))
                .signWith(getSigningKey(), Jwts.SIG.HS256)
                .compact();
    }

    public Boolean validateToken(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return (username.equals(userDetails.getUsername()) && !isTokenExpired(token));
    }

    public Boolean validateToken(String token) {
        try {
            Jwts.parser().verifyWith(getSigningKey()).build().parseSignedClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    public Boolean validateAccessToken(String token) {
        try {
            if (validateToken(token)) {
                String tokenType = extractTokenType(token);
                return "access".equals(tokenType);
            }
            return false;
        } catch (Exception e) {
            return false;
        }
    }

    public Boolean validateRefreshToken(String token) {
        try {
            if (validateToken(token)) {
                String tokenType = extractTokenType(token);
                return "refresh".equals(tokenType);
            }
            return false;
        } catch (Exception e) {
            return false;
        }
    }

    public Boolean isAccessToken(String token) {
        return "access".equals(extractTokenType(token));
    }

    public Boolean isRefreshToken(String token) {
        return "refresh".equals(extractTokenType(token));
    }

    public boolean validateKeycloakToken(String token) {
        // TODO: Implement token validation using Keycloak (e.g., verify signature, expiration)
        // Example: Use Keycloak's TokenVerifier or similar
        try {
            // Placeholder: Assume token is valid if not null
            return token != null && !token.isEmpty();
        } catch (Exception e) {
            return false;
        }
    }
    
    public String extractKeycloakUsername(String token) {
        // TODO: Extract username from Keycloak token (e.g., from claims)
        // Example: Decode JWT and get "preferred_username" claim
        // Placeholder: Return a dummy username
        return "dummyUser";
    }
    
    public List<String> extractKeycloakRoles(String token) {
        // TODO: Extract roles from Keycloak token (e.g., from "realm_access" or "resource_access" claims)
        // Example: Decode JWT and parse roles
        // Placeholder: Return a list with a dummy role
        return List.of("USER");
    }
}