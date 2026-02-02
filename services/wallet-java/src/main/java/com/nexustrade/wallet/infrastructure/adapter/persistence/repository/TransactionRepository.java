package com.nexustrade.wallet.infrastructure.adapter.persistence.repository;

import com.nexustrade.wallet.infrastructure.adapter.persistence.entity.TransactionEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TransactionRepository extends JpaRepository<TransactionEntity, Long> {
    Page<TransactionEntity> findByWalletId(Long walletId, Pageable pageable);
}
