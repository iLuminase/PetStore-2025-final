package com.auth_api.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;

import com.auth_api.config.GoogleOAuthConfig;
import com.auth_api.dto.GoogleTokenResponse;
import com.auth_api.dto.GoogleUserInfo;

import reactor.core.publisher.Mono;

@Service
public class GoogleOAuthService {

    private final GoogleOAuthConfig googleOAuthConfig;
    private final WebClient webClient;

    @Autowired
    public GoogleOAuthService(GoogleOAuthConfig googleOAuthConfig) {
        this.googleOAuthConfig = googleOAuthConfig;
        this.webClient = WebClient.builder().build();
    }

    public String getAuthorizationUrl() {
        return googleOAuthConfig.getAuthorizationUrl();
    }

    public Mono<GoogleTokenResponse> exchangeCodeForToken(String code) {
        MultiValueMap<String, String> formData = new LinkedMultiValueMap<>();
        formData.add("client_id", googleOAuthConfig.getClientId());
        formData.add("client_secret", googleOAuthConfig.getClientSecret());
        formData.add("code", code);
        formData.add("grant_type", "authorization_code");
        formData.add("redirect_uri", googleOAuthConfig.getRedirectUri());

        return webClient.post()
                .uri("https://oauth2.googleapis.com/token")
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .body(BodyInserters.fromFormData(formData))
                .retrieve()
                .bodyToMono(GoogleTokenResponse.class);
    }

    public Mono<GoogleUserInfo> getUserInfo(String accessToken) {
        return webClient.get()
                .uri("https://www.googleapis.com/oauth2/v2/userinfo?access_token=" + accessToken)
                .retrieve()
                .bodyToMono(GoogleUserInfo.class);
    }
}