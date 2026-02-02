package com.nexustrade.wallet.infrastructure.adapter.persistence;

import com.nexustrade.wallet.domain.model.Wallet;
import com.nexustrade.wallet.domain.port.output.LoadWalletPort;
import com.nexustrade.wallet.domain.port.output.SaveWalletPort;
import com.nexustrade.wallet.infrastructure.adapter.persistence.entity.WalletEntity;
import com.nexustrade.wallet.infrastructure.adapter.persistence.repository.WalletRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
@RequiredArgsConstructor
public class WalletPersistenceAdapter implements LoadWalletPort, SaveWalletPort {
    private final WalletRepository walletRepository;

    @Override
    public Optional<Wallet> loadWalletByUserId(Long userId) {
        return walletRepository.findByUserId(userId).map(this::toDomain);
    }

    @Override
    public Wallet saveWallet(Wallet wallet) {
        WalletEntity entity = toEntity(wallet);
        WalletEntity saved = walletRepository.save(entity);
        return toDomain(saved);
    }

    private Wallet toDomain(WalletEntity entity) {
        return Wallet.builder()
                .id(entity.getId())
                .userId(entity.getUserId())
                .balance(entity.getBalance())
                .currency(entity.getCurrency())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    private WalletEntity toEntity(Wallet wallet) {
        return WalletEntity.builder()
                .id(wallet.getId())
                .userId(wallet.getUserId())
                .balance(wallet.getBalance())
                .currency(wallet.getCurrency())
                .updatedAt(wallet.getUpdatedAt())
                .build();
    }
}
