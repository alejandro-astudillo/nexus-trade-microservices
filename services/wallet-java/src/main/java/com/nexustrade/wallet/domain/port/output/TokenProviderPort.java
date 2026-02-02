package com.nexustrade.wallet.domain.port.output;

import com.nexustrade.wallet.domain.model.User;

public interface TokenProviderPort {
    String generateToken(User user);
    String getUsernameFromToken(String token);
    boolean validateToken(String token);
}
