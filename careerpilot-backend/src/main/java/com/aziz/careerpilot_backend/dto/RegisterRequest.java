package com.aziz.careerpilot_backend.dto;


import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(

        @NotBlank(
                message = "Le prénom est obligatoire"
        )
        @Size(
                max = 80,
                message = "Le prénom est trop long"
        )
        String firstName,

        @NotBlank(
                message = "Le nom est obligatoire"
        )
        @Size(
                max = 80,
                message = "Le nom est trop long"
        )
        String lastName,

        @NotBlank(
                message = "L'email est obligatoire"
        )
        @Email(
                message = "L'adresse email est invalide"
        )
        String email,

        @NotBlank(
                message = "Le mot de passe est obligatoire"
        )
        @Size(
                min = 8,
                max = 100,
                message = "Le mot de passe doit contenir entre 8 et 100 caractères"
        )
        String password

) {
}