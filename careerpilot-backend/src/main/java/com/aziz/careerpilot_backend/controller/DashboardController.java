package com.aziz.careerpilot_backend.controller;

import com.aziz.careerpilot_backend.dto.DashboardStatisticsResponse;

import com.aziz.careerpilot_backend.entity.AppUser;

import com.aziz.careerpilot_backend.service.DashboardService;

import org.springframework.security.core.annotation.AuthenticationPrincipal;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(
            DashboardService dashboardService
    ) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/statistics")
    public DashboardStatisticsResponse getStatistics(
            @AuthenticationPrincipal
            AppUser currentUser
    ) {
        return dashboardService.getStatistics(
                currentUser
        );
    }
}