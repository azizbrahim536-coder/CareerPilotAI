package com.aziz.careerpilot_backend.dto;

import com.aziz.careerpilot_backend.entity.EmploymentType;
import com.aziz.careerpilot_backend.entity.WorkMode;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

public record JobOfferRequest(

        @NotNull(
                message = "L'entreprise est obligatoire"
        )
        Long companyId,

        @NotBlank(
                message = "Le titre de l'offre est obligatoire"
        )
        @Size(
                max = 180,
                message = "Le titre est trop long"
        )
        String title,

        @Size(
                max = 10000,
                message = "La description est trop longue"
        )
        String description,

        @Size(
                max = 150,
                message = "La localisation est trop longue"
        )
        String location,

        @NotNull(
                message = "Le mode de travail est obligatoire"
        )
        WorkMode workMode,

        @NotNull(
                message = "Le type de contrat est obligatoire"
        )
        EmploymentType employmentType,

        @Size(
                max = 500,
                message = "Le lien de l'offre est trop long"
        )
        String sourceUrl,

        @PositiveOrZero(
                message = "Le salaire minimum doit être positif"
        )
        BigDecimal salaryMin,

        @PositiveOrZero(
                message = "Le salaire maximum doit être positif"
        )
        BigDecimal salaryMax,

        @Size(
                min = 3,
                max = 10,
                message = "La devise est invalide"
        )
        String currency,

        LocalDate deadline

) {
}