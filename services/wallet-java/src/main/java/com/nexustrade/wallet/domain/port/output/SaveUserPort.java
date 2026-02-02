package com.nexustrade.wallet.domain.port.output;

import com.nexustrade.wallet.domain.model.User;

public interface SaveUserPort {
    User saveUser(User user);
}
