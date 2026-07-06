package com.aziz.careerpilot_backend.controller;

import com.aziz.careerpilot_backend.dto.JobOfferRequest;
import com.aziz.careerpilot_backend.dto.JobOfferResponse;

import com.aziz.careerpilot_backend.entity.AppUser;

import com.aziz.careerpilot_backend.service.JobOfferService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;

import org.springframework.security.core.annotation.AuthenticationPrincipal;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/job-offers")
public class JobOfferController {

    private final JobOfferService
            jobOfferService;

    public JobOfferController(
            JobOfferService jobOfferService
    ) {
        this.jobOfferService =
                jobOfferService;
    }

    @GetMapping
    public List<JobOfferResponse> getAll(
            @RequestParam(
                    required = false
            )
            Long companyId,

            @AuthenticationPrincipal
            AppUser currentUser
    ) {
        return jobOfferService.getAll(
                companyId,
                currentUser
        );
    }

    @GetMapping("/{id}")
    public JobOfferResponse getById(
            @PathVariable
            Long id,

            @AuthenticationPrincipal
            AppUser currentUser
    ) {
        return jobOfferService.getById(
                id,
                currentUser
        );
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public JobOfferResponse create(
            @Valid
            @RequestBody
            JobOfferRequest request,

            @AuthenticationPrincipal
            AppUser currentUser
    ) {
        return jobOfferService.create(
                request,
                currentUser
        );
    }

    @PutMapping("/{id}")
    public JobOfferResponse update(
            @PathVariable
            Long id,

            @Valid
            @RequestBody
            JobOfferRequest request,

            @AuthenticationPrincipal
            AppUser currentUser
    ) {
        return jobOfferService.update(
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
        jobOfferService.delete(
                id,
                currentUser
        );
    }
}