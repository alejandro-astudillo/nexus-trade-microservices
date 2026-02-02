package com.nexustrade.wallet.infrastructure.config;

import com.nexustrade.wallet.application.service.AuthService;
import com.nexustrade.wallet.application.service.WalletService;
import com.nexustrade.wallet.domain.model.User;
import com.nexustrade.wallet.domain.model.Wallet;
import com.nexustrade.wallet.domain.port.output.LoadUserPort;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.math.BigDecimal;
import java.util.Optional;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class DataSeeder {

    private final AuthService authService;
    private final WalletService walletService;
    private final LoadUserPort loadUserPort;

    @Bean
    public CommandLineRunner initData() {
        return args -> {
            try {
                String email = "guest@nexustrade.com";
                User user;

                Optional<User> existingUser = loadUserPort.loadUserByEmail(email);
                if (existingUser.isEmpty()) {
                    log.info("Creating guest user...");
                    user = authService.register(email, "guestPassword123", "Guest User");
                } else {
                    log.info("Guest user already exists.");
                    user = existingUser.get();
                }

                // Ensure funds
                Wallet wallet = walletService.getMyWallet(user.getId());
                if (wallet.getBalance().compareTo(new BigDecimal("1000")) < 0) {
                    log.info("Top up guest wallet...");
                    walletService.deposit(user.getId(), new BigDecimal("100000"));
                }
            } catch (Exception e) {
                log.error("Error seeding data", e);
            }
        };
    }
}
