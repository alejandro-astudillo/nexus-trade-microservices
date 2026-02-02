package com.nexustrade.wallet.infrastructure.adapter.web;

import com.nexustrade.wallet.application.service.WalletService;
import com.nexustrade.wallet.domain.model.Transaction;
import com.nexustrade.wallet.domain.model.User;
import com.nexustrade.wallet.domain.model.Wallet;
import com.nexustrade.wallet.domain.port.output.LoadUserPort;
import com.nexustrade.wallet.infrastructure.adapter.web.dto.WalletDto;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/v1/wallets")
@RequiredArgsConstructor
@Slf4j
public class WalletController {

    private final WalletService walletService;
    private final LoadUserPort loadUserPort;

    private Long getCurrentUserId(Authentication authentication) {
        org.springframework.security.core.userdetails.User principal = 
            (org.springframework.security.core.userdetails.User) authentication.getPrincipal();
        return loadUserPort.loadUserByEmail(principal.getUsername())
                .map(User::getId)
                .orElseThrow(() -> new IllegalStateException("User not found"));
    }

    @GetMapping("/me")
    public ResponseEntity<WalletDto.WalletDetail> getMyWallet(Authentication authentication) {
        Long userId = getCurrentUserId(authentication);
        Wallet wallet = walletService.getMyWallet(userId);
        return ResponseEntity.ok(WalletDto.WalletDetail.builder()
                .id(wallet.getId())
                .balance(wallet.getBalance())
                .currency(wallet.getCurrency())
                .updatedAt(wallet.getUpdatedAt())
                .build());
    }

    @GetMapping("/me/transactions")
    public ResponseEntity<Page<Transaction>> getTransactions(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Long userId = getCurrentUserId(authentication);
        return ResponseEntity.ok(walletService.getMyTransactions(userId, 
                PageRequest.of(page, size, Sort.by("createdAt").descending())));
    }

    @PostMapping("/me/deposit")
    public ResponseEntity<WalletDto.WalletDetail> deposit(
            Authentication authentication,
            @RequestBody WalletDto.DepositRequest request
    ) {
        Long userId = getCurrentUserId(authentication);
        Wallet wallet = walletService.deposit(userId, request.getAmount());
        return ResponseEntity.ok(WalletDto.WalletDetail.builder()
                .id(wallet.getId())
                .balance(wallet.getBalance())
                .currency(wallet.getCurrency())
                .updatedAt(wallet.getUpdatedAt())
                .build());
    }

    @PostMapping("/internal/withdraw")
    public ResponseEntity<WalletDto.WalletDetail> internalWithdraw(@RequestBody WalletDto.WithdrawRequest request) {
        log.info("Received internal withdraw request for email: {}, amount: {}", request.getEmail(), request.getAmount());
        Long userId = loadUserPort.loadUserByEmail(request.getEmail())
                .map(User::getId)
                .orElseThrow(() -> new IllegalStateException("User not found"));
        
        Wallet wallet = walletService.withdraw(userId, request.getAmount());
        
        return ResponseEntity.ok(WalletDto.WalletDetail.builder()
                .id(wallet.getId())
                .balance(wallet.getBalance())
                .currency(wallet.getCurrency())
                .updatedAt(wallet.getUpdatedAt())
                .build());
    }

    @PostMapping("/internal/deposit")
    public ResponseEntity<WalletDto.WalletDetail> internalDeposit(@RequestBody WalletDto.WithdrawRequest request) {
        log.info("Received internal deposit request for email: {}, amount: {}", request.getEmail(), request.getAmount());
        Long userId = loadUserPort.loadUserByEmail(request.getEmail())
                .map(User::getId)
                .orElseThrow(() -> new IllegalStateException("User not found"));
        
        Wallet wallet = walletService.deposit(userId, request.getAmount());
        
        return ResponseEntity.ok(WalletDto.WalletDetail.builder()
                .id(wallet.getId())
                .balance(wallet.getBalance())
                .currency(wallet.getCurrency())
                .updatedAt(wallet.getUpdatedAt())
                .build());
    }
}
