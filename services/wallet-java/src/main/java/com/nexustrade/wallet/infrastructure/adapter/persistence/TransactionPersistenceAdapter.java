package com.nexustrade.wallet.infrastructure.adapter.persistence;

import com.nexustrade.wallet.domain.model.Transaction;
import com.nexustrade.wallet.domain.port.output.LoadTransactionPort;
import com.nexustrade.wallet.domain.port.output.SaveTransactionPort;
import com.nexustrade.wallet.infrastructure.adapter.persistence.entity.TransactionEntity;
import com.nexustrade.wallet.infrastructure.adapter.persistence.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class TransactionPersistenceAdapter implements LoadTransactionPort, SaveTransactionPort {
    private final TransactionRepository transactionRepository;

    @Override
    public Page<Transaction> loadTransactionsByWalletId(Long walletId, Pageable pageable) {
        return transactionRepository.findByWalletId(walletId, pageable).map(this::toDomain);
    }

    @Override
    public Transaction saveTransaction(Transaction transaction) {
        TransactionEntity entity = toEntity(transaction);
        TransactionEntity saved = transactionRepository.save(entity);
        return toDomain(saved);
    }

    private Transaction toDomain(TransactionEntity entity) {
        return Transaction.builder()
                .id(entity.getId())
                .walletId(entity.getWalletId())
                .amount(entity.getAmount())
                .type(entity.getType())
                .status(entity.getStatus())
                .createdAt(entity.getCreatedAt())
                .build();
    }

    private TransactionEntity toEntity(Transaction transaction) {
        return TransactionEntity.builder()
                .id(transaction.getId())
                .walletId(transaction.getWalletId())
                .amount(transaction.getAmount())
                .type(transaction.getType())
                .status(transaction.getStatus())
                .createdAt(transaction.getCreatedAt())
                .build();
    }
}
