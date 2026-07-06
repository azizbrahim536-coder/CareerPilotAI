package com.aziz.careerpilot_backend.dto;

import java.time.LocalDateTime;

public record CompanyResponse(

        Long id,

        String name,

        String website,

        String location,

        String industry,

        String notes,

        LocalDateTime createdAt,

        LocalDateTime updatedAt

) {
}