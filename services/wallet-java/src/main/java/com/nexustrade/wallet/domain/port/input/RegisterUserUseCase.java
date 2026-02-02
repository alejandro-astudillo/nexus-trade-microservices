package com.nexustrade.wallet.domain.port.input;

import com.nexustrade.wallet.domain.model.User;

public interface RegisterUserUseCase {
    User register(String email, String password, String fullName);
}
