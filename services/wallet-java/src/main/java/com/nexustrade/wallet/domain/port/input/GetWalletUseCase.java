package com.nexustrade.wallet.domain.port.input;

import com.nexustrade.wallet.domain.model.Wallet;

public interface GetWalletUseCase {
    Wallet getMyWallet(Long userId);
}
