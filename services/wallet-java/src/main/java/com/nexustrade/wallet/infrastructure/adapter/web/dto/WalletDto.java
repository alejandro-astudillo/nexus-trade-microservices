package com.nexustrade.wallet.infrastructure.adapter.web.dto;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public class WalletDto {
    @Data
    @Builder
    public static class WalletDetail {
        private Long id;
        private BigDecimal balance;
        private String currency;
        private LocalDateTime updatedAt;
    }

    @Data
    public static class DepositRequest {
        private BigDecimal amount;
    }

    @Data
    public static class WithdrawRequest {
        private String email;
        private BigDecimal amount;
    }
}
