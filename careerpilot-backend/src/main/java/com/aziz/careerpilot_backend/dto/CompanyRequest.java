package com.aziz.careerpilot_backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CompanyRequest(

        @NotBlank(
                message = "Le nom de l'entreprise est obligatoire"
        )
        @Size(
                max = 150,
                message = "Le nom est trop long"
        )
        String name,

        @Size(
                max = 500,
                message = "Le site web est trop long"
        )
        String website,

        @Size(
                max = 150,
                message = "La localisation est trop longue"
        )
        String location,

        @Size(
                max = 150,
                message = "Le secteur est trop long"
        )
        String industry,

        @Size(
                max = 5000,
                message = "Les notes sont trop longues"
        )
        String notes

) {
}