package com.aziz.careerpilot_backend.dto;

import com.aziz.careerpilot_backend.entity.ApplicationStatus;

import jakarta.validation.constraints.NotNull;

public record ApplicationStatusRequest(

        @NotNull(
                message = "Le nouveau statut est obligatoire"
        )
        ApplicationStatus status

) {
}