package com.nexustrade.wallet.domain.port.output;

import com.nexustrade.wallet.domain.model.User;
import java.util.Optional;

public interface LoadUserPort {
    Optional<User> loadUserByEmail(String email);
    Optional<User> loadUserById(Long id);
    boolean existsByEmail(String email);
}
