package com.aziz.careerpilot_backend.dto;

import com.aziz.careerpilot_backend.entity.ApplicationStatus;

import java.util.List;
import java.util.Map;

public record DashboardStatisticsResponse(

        long totalApplications,

        long savedApplications,

        long appliedApplications,

        long interviewApplications,

        long offerApplications,

        long rejectedApplications,

        long activeApplications,

        long applicationsThisMonth,

        double responseRate,

        double offerRate,

        Map<ApplicationStatus, Long> statusDistribution,

        List<DashboardApplicationItem> upcomingInterviews,

        List<DashboardApplicationItem> upcomingFollowUps,

        List<DashboardApplicationItem> recentApplications

) {
}