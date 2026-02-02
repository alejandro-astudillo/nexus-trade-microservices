package com.nexustrade.wallet.infrastructure.adapter.web.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class AuthDto {
    @Data
    public static class LoginRequest {
        @NotBlank @Email
        private String email;
        @NotBlank
        private String password;
    }

    @Data
    public static class RegisterRequest {
        @NotBlank @Email
        private String email;
        @NotBlank @Size(min = 8)
        private String password;
        @NotBlank
        private String fullName;
    }

    @Data
    @Builder
    public static class TokenResponse {
        private String accessToken;
        @Builder.Default
        private String tokenType = "Bearer";
        private long expiresIn;
    }
}
