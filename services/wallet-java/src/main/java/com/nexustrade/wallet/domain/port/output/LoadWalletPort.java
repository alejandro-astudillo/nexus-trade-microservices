package com.nexustrade.wallet.domain.port.output;

import com.nexustrade.wallet.domain.model.Wallet;
import java.util.Optional;

public interface LoadWalletPort {
    Optional<Wallet> loadWalletByUserId(Long userId);
}
