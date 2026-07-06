package com.aziz.careerpilot_backend.dto;

import com.aziz.careerpilot_backend.entity.EmploymentType;
import com.aziz.careerpilot_backend.entity.WorkMode;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record JobOfferResponse(

        Long id,

        String title,

        String description,

        String location,

        WorkMode workMode,

        EmploymentType employmentType,

        String sourceUrl,

        BigDecimal salaryMin,

        BigDecimal salaryMax,

        String currency,

        LocalDate deadline,

        Long companyId,

        String companyName,

        LocalDateTime createdAt,

        LocalDateTime updatedAt

) {
}