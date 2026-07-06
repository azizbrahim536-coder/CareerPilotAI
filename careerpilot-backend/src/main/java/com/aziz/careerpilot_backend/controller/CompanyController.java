package com.aziz.careerpilot_backend.controller;

import com.aziz.careerpilot_backend.dto.CompanyRequest;
import com.aziz.careerpilot_backend.dto.CompanyResponse;

import com.aziz.careerpilot_backend.entity.AppUser;

import com.aziz.careerpilot_backend.service.CompanyService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;

import org.springframework.security.core.annotation.AuthenticationPrincipal;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/companies")
public class CompanyController {

    private final CompanyService companyService;

    public CompanyController(
            CompanyService companyService
    ) {
        this.companyService =
                companyService;
    }

    @GetMapping
    public List<CompanyResponse> getAll(
            @AuthenticationPrincipal
            AppUser currentUser
    ) {
        return companyService.getAll(
                currentUser
        );
    }

    @GetMapping("/{id}")
    public CompanyResponse getById(
            @PathVariable
            Long id,

            @AuthenticationPrincipal
            AppUser currentUser
    ) {
        return companyService.getById(
                id,
                currentUser
        );
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CompanyResponse create(
            @Valid
            @RequestBody
            CompanyRequest request,

            @AuthenticationPrincipal
            AppUser currentUser
    ) {
        return companyService.create(
                request,
                currentUser
        );
    }

    @PutMapping("/{id}")
    public CompanyResponse update(
            @PathVariable
            Long id,

            @Valid
            @RequestBody
            CompanyRequest request,

            @AuthenticationPrincipal
            AppUser currentUser
    ) {
        return companyService.update(
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
        companyService.delete(
                id,
                currentUser
        );
    }
}