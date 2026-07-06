package com.aziz.careerpilot_backend.dto;

import com.aziz.careerpilot_backend.entity.ApplicationStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record DashboardApplicationItem(

        Long applicationId,

        ApplicationStatus status,

        Long jobOfferId,

        String jobTitle,

        Long companyId,

        String companyName,

        String location,

        LocalDate appliedDate,

        LocalDateTime interviewDate,

        LocalDate nextFollowUpDate,

        LocalDateTime updatedAt

) {
}