package com.nexustrade.wallet.domain.port.output;

import com.nexustrade.wallet.domain.model.Transaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface SaveTransactionPort {
    Transaction saveTransaction(Transaction transaction);
}
