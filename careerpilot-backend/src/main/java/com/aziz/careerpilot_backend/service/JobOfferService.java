package com.aziz.careerpilot_backend.service;

import com.aziz.careerpilot_backend.dto.JobOfferRequest;
import com.aziz.careerpilot_backend.dto.JobOfferResponse;

import com.aziz.careerpilot_backend.entity.AppUser;
import com.aziz.careerpilot_backend.entity.Company;
import com.aziz.careerpilot_backend.entity.JobOffer;

import com.aziz.careerpilot_backend.repository.JobOfferRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;
import java.util.Locale;

@Service
public class JobOfferService {

    private final JobOfferRepository
            jobOfferRepository;

    private final CompanyService companyService;

    public JobOfferService(
            JobOfferRepository jobOfferRepository,
            CompanyService companyService
    ) {
        this.jobOfferRepository =
                jobOfferRepository;

        this.companyService =
                companyService;
    }

    public List<JobOfferResponse> getAll(
            Long companyId,
            AppUser currentUser
    ) {
        List<JobOffer> offers;

        if (companyId == null) {

            offers =
                    jobOfferRepository
                            .findAllByOwnerIdOrderByCreatedAtDesc(
                                    currentUser.getId()
                            );

        } else {

            companyService.findOwnedCompany(
                    companyId,
                    currentUser.getId()
            );

            offers =
                    jobOfferRepository
                            .findAllByOwnerIdAndCompanyIdOrderByCreatedAtDesc(
                                    currentUser.getId(),
                                    companyId
                            );
        }

        return offers
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public JobOfferResponse getById(
            Long id,
            AppUser currentUser
    ) {
        JobOffer offer =
                findOwnedOffer(
                        id,
                        currentUser.getId()
                );

        return toResponse(offer);
    }

    public JobOfferResponse create(
            JobOfferRequest request,
            AppUser currentUser
    ) {
        validateSalary(
                request.salaryMin(),
                request.salaryMax()
        );

        Company company =
                companyService.findOwnedCompany(
                        request.companyId(),
                        currentUser.getId()
                );

        JobOffer offer =
                new JobOffer();

        applyRequest(
                offer,
                request,
                company
        );

        offer.setOwner(currentUser);

        JobOffer savedOffer =
                jobOfferRepository.save(offer);

        return toResponse(savedOffer);
    }

    public JobOfferResponse update(
            Long id,
            JobOfferRequest request,
            AppUser currentUser
    ) {
        validateSalary(
                request.salaryMin(),
                request.salaryMax()
        );

        JobOffer offer =
                findOwnedOffer(
                        id,
                        currentUser.getId()
                );

        Company company =
                companyService.findOwnedCompany(
                        request.companyId(),
                        currentUser.getId()
                );

        applyRequest(
                offer,
                request,
                company
        );

        JobOffer updatedOffer =
                jobOfferRepository.save(offer);

        return toResponse(updatedOffer);
    }

    public void delete(
            Long id,
            AppUser currentUser
    ) {
        JobOffer offer =
                findOwnedOffer(
                        id,
                        currentUser.getId()
                );

        jobOfferRepository.delete(offer);
    }

    private JobOffer findOwnedOffer(
            Long id,
            Long ownerId
    ) {
        return jobOfferRepository
                .findByIdAndOwnerId(
                        id,
                        ownerId
                )
                .orElseThrow(
                        () ->
                                new ResponseStatusException(
                                        HttpStatus.NOT_FOUND,
                                        "Offre d'emploi introuvable"
                                )
                );
    }

    private void applyRequest(
            JobOffer offer,
            JobOfferRequest request,
            Company company
    ) {
        offer.setTitle(
                request.title().trim()
        );

        offer.setDescription(
                clean(request.description())
        );

        offer.setLocation(
                clean(request.location())
        );

        offer.setWorkMode(
                request.workMode()
        );

        offer.setEmploymentType(
                request.employmentType()
        );

        offer.setSourceUrl(
                clean(request.sourceUrl())
        );

        offer.setSalaryMin(
                request.salaryMin()
        );

        offer.setSalaryMax(
                request.salaryMax()
        );

        offer.setCurrency(
                normalizeCurrency(
                        request.currency()
                )
        );

        offer.setDeadline(
                request.deadline()
        );

        offer.setCompany(company);
    }

    private void validateSalary(
            BigDecimal salaryMin,
            BigDecimal salaryMax
    ) {
        if (
                salaryMin != null
                        &&
                        salaryMax != null
                        &&
                        salaryMin.compareTo(
                                salaryMax
                        ) > 0
        ) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Le salaire minimum ne peut pas dépasser le salaire maximum"
            );
        }
    }

    private JobOfferResponse toResponse(
            JobOffer offer
    ) {
        return new JobOfferResponse(
                offer.getId(),
                offer.getTitle(),
                offer.getDescription(),
                offer.getLocation(),
                offer.getWorkMode(),
                offer.getEmploymentType(),
                offer.getSourceUrl(),
                offer.getSalaryMin(),
                offer.getSalaryMax(),
                offer.getCurrency(),
                offer.getDeadline(),
                offer.getCompany().getId(),
                offer.getCompany().getName(),
                offer.getCreatedAt(),
                offer.getUpdatedAt()
        );
    }

    private String normalizeCurrency(
            String currency
    ) {
        if (
                currency == null
                        ||
                        currency.isBlank()
        ) {
            return "TND";
        }

        return currency
                .trim()
                .toUpperCase(
                        Locale.ROOT
                );
    }

    private String clean(
            String value
    ) {
        if (
                value == null
                        ||
                        value.isBlank()
        ) {
            return null;
        }

        return value.trim();
    }
}