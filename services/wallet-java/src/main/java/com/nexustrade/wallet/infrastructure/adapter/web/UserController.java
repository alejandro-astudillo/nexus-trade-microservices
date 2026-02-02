package com.nexustrade.wallet.infrastructure.adapter.web;

import com.nexustrade.wallet.domain.model.User;
import com.nexustrade.wallet.domain.port.output.LoadUserPort;
import com.nexustrade.wallet.infrastructure.adapter.web.dto.UserProfileDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final LoadUserPort loadUserPort;

    @GetMapping("/me")
    public ResponseEntity<UserProfileDto> getMe(Authentication authentication) {
        org.springframework.security.core.userdetails.User principal = 
            (org.springframework.security.core.userdetails.User) authentication.getPrincipal();
        
        User user = loadUserPort.loadUserByEmail(principal.getUsername())
                .orElseThrow(() -> new IllegalStateException("User not found"));

        return ResponseEntity.ok(UserProfileDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .createdAt(user.getCreatedAt())
                .build());
    }
}
