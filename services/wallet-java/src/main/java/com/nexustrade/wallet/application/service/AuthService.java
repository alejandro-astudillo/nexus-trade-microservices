package com.nexustrade.wallet.application.service;

import com.nexustrade.wallet.domain.model.User;
import com.nexustrade.wallet.domain.model.Wallet;
import com.nexustrade.wallet.domain.port.input.LoginUseCase;
import com.nexustrade.wallet.domain.port.input.RegisterUserUseCase;
import com.nexustrade.wallet.domain.port.output.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuthService implements RegisterUserUseCase, LoginUseCase {
    private final LoadUserPort loadUserPort;
    private final SaveUserPort saveUserPort;
    private final SaveWalletPort saveWalletPort;
    private final PasswordEncoderPort passwordEncoderPort;
    private final TokenProviderPort tokenProviderPort;

    @Override
    public User register(String email, String password, String fullName) {
        if (loadUserPort.existsByEmail(email)) {
            throw new IllegalArgumentException("User with this email already exists");
        }

        User user = User.builder()
                .email(email)
                .passwordHash(passwordEncoderPort.encode(password))
                .fullName(fullName)
                .build();

        User savedUser = saveUserPort.saveUser(user);

        // Create initial wallet
        Wallet wallet = Wallet.builder()
                .userId(savedUser.getId())
                .balance(BigDecimal.ZERO)
                .currency("USD")
                .build();
        saveWalletPort.saveWallet(wallet);

        return savedUser;
    }

    @Override
    public String login(String email, String password) {
        User user = loadUserPort.loadUserByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Invalid credentials"));

        if (!passwordEncoderPort.matches(password, user.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid credentials");
        }

        return tokenProviderPort.generateToken(user);
    }
}
