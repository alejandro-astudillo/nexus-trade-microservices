package com.nexustrade.wallet.domain.port.input;

import com.nexustrade.wallet.domain.model.Transaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface GetTransactionsUseCase {
    Page<Transaction> getMyTransactions(Long userId, Pageable pageable);
}
