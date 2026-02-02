package com.nexustrade.wallet.domain.port.input;

import com.nexustrade.wallet.domain.model.Wallet;
import java.math.BigDecimal;

public interface DepositUseCase {
    Wallet deposit(Long userId, BigDecimal amount);
}
