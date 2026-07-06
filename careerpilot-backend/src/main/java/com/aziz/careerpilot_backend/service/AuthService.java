package com.aziz.careerpilot_backend.service;



import com.aziz.careerpilot_backend.dto.AuthResponse;
import com.aziz.careerpilot_backend.dto.LoginRequest;
import com.aziz.careerpilot_backend.dto.RegisterRequest;
import com.aziz.careerpilot_backend.entity.AppUser;
import com.aziz.careerpilot_backend.entity.Role;
import com.aziz.careerpilot_backend.repository.AppUserRepository;
import com.aziz.careerpilot_backend.security.JwtService;
import org.springframework.http.HttpStatus;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;

import org.springframework.security.core.AuthenticationException;

import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.stereotype.Service;

import org.springframework.web.server.ResponseStatusException;

import java.util.Locale;

@Service
public class AuthService {

    private final AppUserRepository userRepository;

    private final PasswordEncoder passwordEncoder;

    private final AuthenticationManager
            authenticationManager;

    private final JwtService jwtService;

    public AuthService(
            AppUserRepository userRepository,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager,
            JwtService jwtService
    ) {
        this.userRepository =
                userRepository;

        this.passwordEncoder =
                passwordEncoder;

        this.authenticationManager =
                authenticationManager;

        this.jwtService =
                jwtService;
    }

    public AuthResponse register(
            RegisterRequest request
    ) {
        String email =
                normalizeEmail(
                        request.email()
                );

        if (
                userRepository
                        .existsByEmailIgnoreCase(
                                email
                        )
        ) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Un compte existe déjà avec cet email"
            );
        }

        AppUser user =
                new AppUser();

        user.setFirstName(
                request.firstName().trim()
        );

        user.setLastName(
                request.lastName().trim()
        );

        user.setEmail(email);

        user.setPassword(
                passwordEncoder.encode(
                        request.password()
                )
        );

        user.setRole(
                Role.USER
        );

        user.setEnabled(true);

        AppUser savedUser =
                userRepository.save(user);

        return createAuthResponse(
                savedUser
        );
    }

    public AuthResponse login(
            LoginRequest request
    ) {
        String email =
                normalizeEmail(
                        request.email()
                );

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            email,
                            request.password()
                    )
            );

        } catch (
                AuthenticationException exception
        ) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Email ou mot de passe incorrect"
            );
        }

        AppUser user =
                userRepository
                        .findByEmailIgnoreCase(
                                email
                        )
                        .orElseThrow(
                                () ->
                                        new ResponseStatusException(
                                                HttpStatus.NOT_FOUND,
                                                "Utilisateur introuvable"
                                        )
                        );

        return createAuthResponse(user);
    }

    private AuthResponse createAuthResponse(
            AppUser user
    ) {
        String token =
                jwtService.generateToken(user);

        return new AuthResponse(
                token,
                "Bearer",
                jwtService.getExpiration(),
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getRole()
        );
    }

    private String normalizeEmail(
            String email
    ) {
        return email
                .trim()
                .toLowerCase(
                        Locale.ROOT
                );
    }
}