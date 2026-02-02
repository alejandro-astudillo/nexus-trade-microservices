package com.nexustrade.wallet.infrastructure.adapter.persistence.repository;

import com.nexustrade.wallet.infrastructure.adapter.persistence.entity.WalletEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface WalletRepository extends JpaRepository<WalletEntity, Long> {
    Optional<WalletEntity> findByUserId(Long userId);
}
