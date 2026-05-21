package com.flowdesk.api.config;

import com.flowdesk.api.model.Role;
import com.flowdesk.api.model.User;
import com.flowdesk.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (!userRepository.existsByEmail("admin@flowdesk.com")) {
            userRepository.save(User.builder()
                    .name("Administrador")
                    .email("admin@flowdesk.com")
                    .password(passwordEncoder.encode("admin123"))
                    .role(Role.ADMIN)
                    .build());
            log.info("Admin user created: admin@flowdesk.com / admin123");
        }

        if (!userRepository.existsByEmail("analista@flowdesk.com")) {
            userRepository.save(User.builder()
                    .name("Analista Padrão")
                    .email("analista@flowdesk.com")
                    .password(passwordEncoder.encode("analista123"))
                    .role(Role.ANALISTA)
                    .build());
        }

        if (!userRepository.existsByEmail("usuario@flowdesk.com")) {
            userRepository.save(User.builder()
                    .name("Usuário Padrão")
                    .email("usuario@flowdesk.com")
                    .password(passwordEncoder.encode("usuario123"))
                    .role(Role.USUARIO)
                    .build());
        }
    }
}
