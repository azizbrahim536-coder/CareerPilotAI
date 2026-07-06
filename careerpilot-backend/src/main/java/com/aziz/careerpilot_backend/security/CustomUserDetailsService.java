package com.aziz.careerpilot_backend.security;



import com.aziz.careerpilot_backend.repository.AppUserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService
        implements UserDetailsService {

    private final AppUserRepository userRepository;

    public CustomUserDetailsService(
            AppUserRepository userRepository
    ) {
        this.userRepository =
                userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(
            String email
    ) throws UsernameNotFoundException {

        return userRepository
                .findByEmailIgnoreCase(
                        email.trim()
                )
                .orElseThrow(
                        () ->
                                new UsernameNotFoundException(
                                        "Utilisateur introuvable"
                                )
                );
    }
}