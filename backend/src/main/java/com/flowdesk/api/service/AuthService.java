package com.flowdesk.api.service;

import com.flowdesk.api.dto.AuthRequest;
import com.flowdesk.api.dto.AuthResponse;
import com.flowdesk.api.dto.UserResponse;
import com.flowdesk.api.repository.UserRepository;
import com.flowdesk.api.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final JwtService jwtService;

    public AuthResponse authenticate(AuthRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password()));

        var user = userRepository.findByEmail(request.email()).orElseThrow();
        var token = jwtService.generateToken(user);
        return new AuthResponse(token, UserResponse.from(user));
    }
}
