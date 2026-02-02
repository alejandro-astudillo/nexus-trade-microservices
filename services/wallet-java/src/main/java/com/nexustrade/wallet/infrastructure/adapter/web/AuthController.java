package com.nexustrade.wallet.infrastructure.adapter.web;

import com.nexustrade.wallet.application.service.AuthService;
import com.nexustrade.wallet.domain.model.User;
import com.nexustrade.wallet.infrastructure.adapter.web.dto.AuthDto;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @Value("${jwt.expiration:86400000}")
    private long jwtExpiration;

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody @Valid AuthDto.RegisterRequest request) {
        authService.register(request.getEmail(), request.getPassword(), request.getFullName());
        return ResponseEntity.status(HttpStatus.CREATED).body("User created successfully");
    }

    @PostMapping("/login")
    public ResponseEntity<AuthDto.TokenResponse> login(@RequestBody @Valid AuthDto.LoginRequest request) {
        String token = authService.login(request.getEmail(), request.getPassword());
        return ResponseEntity.ok(AuthDto.TokenResponse.builder()
                .accessToken(token)
                .expiresIn(jwtExpiration)
                .build());
    }
}
