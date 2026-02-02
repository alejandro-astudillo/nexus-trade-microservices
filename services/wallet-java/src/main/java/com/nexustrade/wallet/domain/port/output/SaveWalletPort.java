package com.nexustrade.wallet.domain.port.output;

import com.nexustrade.wallet.domain.model.Wallet;

public interface SaveWalletPort {
    Wallet saveWallet(Wallet wallet);
}
