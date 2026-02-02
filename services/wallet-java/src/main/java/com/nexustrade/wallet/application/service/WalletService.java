package com.nexustrade.wallet.application.service;

import com.nexustrade.wallet.domain.model.*;
import com.nexustrade.wallet.domain.port.input.DepositUseCase;
import com.nexustrade.wallet.domain.port.input.GetTransactionsUseCase;
import com.nexustrade.wallet.domain.port.input.GetWalletUseCase;
import com.nexustrade.wallet.domain.port.output.LoadTransactionPort;
import com.nexustrade.wallet.domain.port.output.LoadWalletPort;
import com.nexustrade.wallet.domain.port.output.SaveTransactionPort;
import com.nexustrade.wallet.domain.port.output.SaveWalletPort;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class WalletService implements GetWalletUseCase, DepositUseCase, GetTransactionsUseCase {
    private final LoadWalletPort loadWalletPort;
    private final SaveWalletPort saveWalletPort;
    private final SaveTransactionPort saveTransactionPort;
    private final LoadTransactionPort loadTransactionPort;

    @Override
    public Wallet getMyWallet(Long userId) {
        return loadWalletPort.loadWalletByUserId(userId)
                .orElseThrow(() -> new IllegalStateException("Wallet not found for user"));
    }

    @Override
    @Transactional
    public Wallet deposit(Long userId, BigDecimal amount) {
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Deposit amount must be positive");
        }

        Wallet wallet = getMyWallet(userId);
        wallet.setBalance(wallet.getBalance().add(amount));
        Wallet savedWallet = saveWalletPort.saveWallet(wallet);

        Transaction transaction = Transaction.builder()
                .walletId(wallet.getId())
                .amount(amount)
                .type(TransactionType.DEPOSIT)
                .status(TransactionStatus.COMPLETED)
                .build();
        saveTransactionPort.saveTransaction(transaction);

        return savedWallet;
    }

    @Override
    public Page<Transaction> getMyTransactions(Long userId, Pageable pageable) {
        Wallet wallet = getMyWallet(userId);
        return loadTransactionPort.loadTransactionsByWalletId(wallet.getId(), pageable);
    }

    @Transactional
    public Wallet withdraw(Long userId, BigDecimal amount) {
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Withdrawal amount must be positive");
        }

        Wallet wallet = getMyWallet(userId);
        if (wallet.getBalance().compareTo(amount) < 0) {
            throw new IllegalArgumentException("Insufficient funds");
        }

        wallet.setBalance(wallet.getBalance().subtract(amount));
        Wallet savedWallet = saveWalletPort.saveWallet(wallet);

        Transaction transaction = Transaction.builder()
                .walletId(wallet.getId())
                .amount(amount)
                .type(TransactionType.WITHDRAW)
                .status(TransactionStatus.COMPLETED)
                .build();
        saveTransactionPort.saveTransaction(transaction);

        return savedWallet;
    }
}
