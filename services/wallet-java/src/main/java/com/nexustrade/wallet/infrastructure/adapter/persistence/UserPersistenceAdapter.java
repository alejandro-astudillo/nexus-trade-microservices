package com.nexustrade.wallet.infrastructure.adapter.persistence;

import com.nexustrade.wallet.domain.model.User;
import com.nexustrade.wallet.domain.port.output.LoadUserPort;
import com.nexustrade.wallet.domain.port.output.SaveUserPort;
import com.nexustrade.wallet.infrastructure.adapter.persistence.entity.UserEntity;
import com.nexustrade.wallet.infrastructure.adapter.persistence.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
@RequiredArgsConstructor
public class UserPersistenceAdapter implements LoadUserPort, SaveUserPort {
    private final UserRepository userRepository;

    @Override
    public Optional<User> loadUserByEmail(String email) {
        return userRepository.findByEmail(email).map(this::toDomain);
    }

    @Override
    public Optional<User> loadUserById(Long id) {
        return userRepository.findById(id).map(this::toDomain);
    }

    @Override
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    @Override
    public User saveUser(User user) {
        UserEntity entity = toEntity(user);
        UserEntity saved = userRepository.save(entity);
        return toDomain(saved);
    }

    private User toDomain(UserEntity entity) {
        return User.builder()
                .id(entity.getId())
                .email(entity.getEmail())
                .passwordHash(entity.getPasswordHash())
                .fullName(entity.getFullName())
                .createdAt(entity.getCreatedAt())
                .build();
    }

    private UserEntity toEntity(User user) {
        return UserEntity.builder()
                .id(user.getId())
                .email(user.getEmail())
                .passwordHash(user.getPasswordHash())
                .fullName(user.getFullName())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
