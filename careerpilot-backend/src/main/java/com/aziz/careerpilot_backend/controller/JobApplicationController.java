package com.aziz.careerpilot_backend.controller;

import com.aziz.careerpilot_backend.dto.ApplicationStatusRequest;
import com.aziz.careerpilot_backend.dto.JobApplicationRequest;
import com.aziz.careerpilot_backend.dto.JobApplicationResponse;

import com.aziz.careerpilot_backend.entity.AppUser;
import com.aziz.careerpilot_backend.entity.ApplicationStatus;

import com.aziz.careerpilot_backend.service.JobApplicationService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;

import org.springframework.security.core.annotation.AuthenticationPrincipal;

import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/applications")
public class JobApplicationController {

    private final JobApplicationService
            applicationService;

    public JobApplicationController(
            JobApplicationService applicationService
    ) {
        this.applicationService =
                applicationService;
    }

    @GetMapping
    public List<JobApplicationResponse> getAll(
            @RequestParam(
                    required = false
            )
            ApplicationStatus status,

            @AuthenticationPrincipal
            AppUser currentUser
    ) {
        return applicationService.getAll(
                status,
                currentUser
        );
    }

    @GetMapping("/board")
    public Map<ApplicationStatus, List<JobApplicationResponse>>
    getBoard(
            @AuthenticationPrincipal
            AppUser currentUser
    ) {
        return applicationService.getBoard(
                currentUser
        );
    }

    @GetMapping("/{id}")
    public JobApplicationResponse getById(
            @PathVariable
            Long id,

            @AuthenticationPrincipal
            AppUser currentUser
    ) {
        return applicationService.getById(
                id,
                currentUser
        );
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public JobApplicationResponse create(
            @Valid
            @RequestBody
            JobApplicationRequest request,

            @AuthenticationPrincipal
            AppUser currentUser
    ) {
        return applicationService.create(
                request,
                currentUser
        );
    }

    @PutMapping("/{id}")
    public JobApplicationResponse update(
            @PathVariable
            Long id,

            @Valid
            @RequestBody
            JobApplicationRequest request,

            @AuthenticationPrincipal
            AppUser currentUser
    ) {
        return applicationService.update(
                id,
                request,
                currentUser
        );
    }

    @PatchMapping("/{id}/status")
    public JobApplicationResponse updateStatus(
            @PathVariable
            Long id,

            @Valid
            @RequestBody
            ApplicationStatusRequest request,

            @AuthenticationPrincipal
            AppUser currentUser
    ) {
        return applicationService.updateStatus(
                id,
                request,
                currentUser
        );
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(
            @PathVariable
            Long id,

            @AuthenticationPrincipal
            AppUser currentUser
    ) {
        applicationService.delete(
                id,
                currentUser
        );
    }
}