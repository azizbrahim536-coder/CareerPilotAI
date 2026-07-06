package com.aziz.careerpilot_backend.config;


import com.aziz.careerpilot_backend.security.CustomUserDetailsService;
import com.aziz.careerpilot_backend.security.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;

import org.springframework.security.authentication.dao.DaoAuthenticationProvider;

import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;

import org.springframework.security.config.annotation.web.builders.HttpSecurity;

import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;

import org.springframework.security.config.http.SessionCreationPolicy;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.security.web.SecurityFilterChain;

import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter
            jwtAuthenticationFilter;

    private final CustomUserDetailsService
            userDetailsService;

    public SecurityConfig(
            JwtAuthenticationFilter jwtAuthenticationFilter,
            CustomUserDetailsService userDetailsService
    ) {
        this.jwtAuthenticationFilter =
                jwtAuthenticationFilter;

        this.userDetailsService =
                userDetailsService;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public DaoAuthenticationProvider
    authenticationProvider(
            PasswordEncoder passwordEncoder
    ) {
        DaoAuthenticationProvider provider =
                new DaoAuthenticationProvider(
                        userDetailsService
                );

        provider.setPasswordEncoder(
                passwordEncoder
        );

        return provider;
    }

    @Bean
    public AuthenticationManager
    authenticationManager(
            DaoAuthenticationProvider provider
    ) {
        return new ProviderManager(
                provider
        );
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            DaoAuthenticationProvider provider
    ) throws Exception {

        http
                .csrf(csrf ->
                        csrf.disable()
                )

                .cors(cors ->
                        cors.configurationSource(
                                corsConfigurationSource()
                        )
                )

                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
                )

                .authenticationProvider(
                        provider
                )

                .authorizeHttpRequests(auth ->
                        auth
                                .requestMatchers(
                                        "/auth/**",
                                        "/test/**"
                                )
                                .permitAll()

                                .requestMatchers(
                                        HttpMethod.OPTIONS,
                                        "/**"
                                )
                                .permitAll()

                                .requestMatchers(
                                        "/admin/**"
                                )
                                .hasRole("ADMIN")

                                .anyRequest()
                                .authenticated()
                )

                .exceptionHandling(exception ->
                        exception
                                .authenticationEntryPoint(
                                        (
                                                request,
                                                response,
                                                authException
                                        ) -> {
                                            response.setStatus(401);

                                            response.setContentType(
                                                    MediaType.APPLICATION_JSON_VALUE
                                            );

                                            response
                                                    .getWriter()
                                                    .write(
                                                            """
                                                            {
                                                              "status": 401,
                                                              "message": "Authentification requise"
                                                            }
                                                            """
                                                    );
                                        }
                                )

                                .accessDeniedHandler(
                                        (
                                                request,
                                                response,
                                                accessDeniedException
                                        ) -> {
                                            response.setStatus(403);

                                            response.setContentType(
                                                    MediaType.APPLICATION_JSON_VALUE
                                            );

                                            response
                                                    .getWriter()
                                                    .write(
                                                            """
                                                            {
                                                              "status": 403,
                                                              "message": "Accès refusé"
                                                            }
                                                            """
                                                    );
                                        }
                                )
                )

                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }

    @Bean
    public CorsConfigurationSource
    corsConfigurationSource() {

        CorsConfiguration configuration =
                new CorsConfiguration();

        configuration.setAllowedOrigins(
                List.of(
                        "http://localhost:4200",
                        "http://127.0.0.1:4200"
                )
        );

        configuration.setAllowedMethods(
                List.of(
                        "GET",
                        "POST",
                        "PUT",
                        "PATCH",
                        "DELETE",
                        "OPTIONS"
                )
        );

        configuration.setAllowedHeaders(
                List.of("*")
        );

        configuration.setExposedHeaders(
                List.of("Authorization")
        );

        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration(
                "/**",
                configuration
        );

        return source;
    }
}