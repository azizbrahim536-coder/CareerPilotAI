package com.aziz.careerpilot_backend.dto;

import com.aziz.careerpilot_backend.entity.ApplicationStatus;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record JobApplicationRequest(

        @NotNull(
                message = "L'offre d'emploi est obligatoire"
        )
        Long jobOfferId,

        @NotNull(
                message = "Le statut est obligatoire"
        )
        ApplicationStatus status,

        LocalDate appliedDate,

        LocalDateTime interviewDate,

        LocalDate nextFollowUpDate,

        @Size(
                max = 150,
                message = "Le nom du contact est trop long"
        )
        String contactName,

        @Email(
                message = "L'email du contact est invalide"
        )
        @Size(
                max = 150,
                message = "L'email du contact est trop long"
        )
        String contactEmail,

        @Size(
                max = 50,
                message = "Le numéro de téléphone est trop long"
        )
        String contactPhone,

        @Size(
                max = 10000,
                message = "Les notes sont trop longues"
        )
        String notes

) {
}