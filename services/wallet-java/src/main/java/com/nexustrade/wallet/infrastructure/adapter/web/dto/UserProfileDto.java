package com.nexustrade.wallet.infrastructure.adapter.web.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class UserProfileDto {
    private Long id;
    private String email;
    private String fullName;
    private LocalDateTime createdAt;
}
