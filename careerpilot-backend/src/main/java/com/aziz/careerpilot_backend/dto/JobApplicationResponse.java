package com.aziz.careerpilot_backend.dto;

import com.aziz.careerpilot_backend.entity.ApplicationStatus;
import com.aziz.careerpilot_backend.entity.EmploymentType;
import com.aziz.careerpilot_backend.entity.WorkMode;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record JobApplicationResponse(

        Long id,

        ApplicationStatus status,

        LocalDate appliedDate,

        LocalDateTime interviewDate,

        LocalDate nextFollowUpDate,

        String contactName,

        String contactEmail,

        String contactPhone,

        String notes,

        Long jobOfferId,

        String jobTitle,

        String jobLocation,

        WorkMode workMode,

        EmploymentType employmentType,

        String sourceUrl,

        Long companyId,

        String companyName,

        LocalDateTime createdAt,

        LocalDateTime updatedAt

) {
}