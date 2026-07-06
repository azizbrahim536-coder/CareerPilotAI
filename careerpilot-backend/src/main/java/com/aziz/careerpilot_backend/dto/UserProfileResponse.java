package com.aziz.careerpilot_backend.dto;


import com.aziz.careerpilot_backend.entity.Role;

import java.time.LocalDateTime;

public record UserProfileResponse(

        Long id,

        String firstName,

        String lastName,

        String email,

        Role role,

        LocalDateTime createdAt

) {
}