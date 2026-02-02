package com.nexustrade.wallet.infrastructure.security;

import com.nexustrade.wallet.domain.model.User;
import com.nexustrade.wallet.domain.port.output.LoadUserPort;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {
    
    private final LoadUserPort loadUserPort;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = loadUserPort.loadUserByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPasswordHash(),
                new ArrayList<>()
        );
    }
}
