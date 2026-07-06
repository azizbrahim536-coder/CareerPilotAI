package com.aziz.careerpilot_backend.dto;


import com.aziz.careerpilot_backend.entity.Role;

public record AuthResponse(

        String token,

        String tokenType,

        long expiresIn,

        Long userId,

        String firstName,

        String lastName,

        String email,

        Role role

) {
}