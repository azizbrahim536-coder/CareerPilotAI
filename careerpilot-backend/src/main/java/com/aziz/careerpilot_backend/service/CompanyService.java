package com.aziz.careerpilot_backend.service;

import com.aziz.careerpilot_backend.dto.CompanyRequest;
import com.aziz.careerpilot_backend.dto.CompanyResponse;

import com.aziz.careerpilot_backend.entity.AppUser;
import com.aziz.careerpilot_backend.entity.Company;

import com.aziz.careerpilot_backend.repository.CompanyRepository;
import com.aziz.careerpilot_backend.repository.JobOfferRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@Transactional
public class CompanyService {

    private final CompanyRepository companyRepository;

    private final JobOfferRepository jobOfferRepository;

    public CompanyService(
            CompanyRepository companyRepository,
            JobOfferRepository jobOfferRepository
    ) {
        this.companyRepository =
                companyRepository;

        this.jobOfferRepository =
                jobOfferRepository;
    }

    public List<CompanyResponse> getAll(
            AppUser currentUser
    ) {
        return companyRepository
                .findAllByOwnerIdOrderByNameAsc(
                        currentUser.getId()
                )
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public CompanyResponse getById(
            Long id,
            AppUser currentUser
    ) {
        Company company =
                findOwnedCompany(
                        id,
                        currentUser.getId()
                );

        return toResponse(company);
    }

    public CompanyResponse create(
            CompanyRequest request,
            AppUser currentUser
    ) {
        String companyName =
                request.name().trim();

        if (
                companyRepository
                        .existsByNameIgnoreCaseAndOwnerId(
                                companyName,
                                currentUser.getId()
                        )
        ) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Cette entreprise existe déjà"
            );
        }

        Company company =
                new Company();

        company.setName(companyName);

        company.setWebsite(
                clean(request.website())
        );

        company.setLocation(
                clean(request.location())
        );

        company.setIndustry(
                clean(request.industry())
        );

        company.setNotes(
                clean(request.notes())
        );

        company.setOwner(currentUser);

        Company savedCompany =
                companyRepository.save(company);

        return toResponse(savedCompany);
    }

    public CompanyResponse update(
            Long id,
            CompanyRequest request,
            AppUser currentUser
    ) {
        Company company =
                findOwnedCompany(
                        id,
                        currentUser.getId()
                );

        String companyName =
                request.name().trim();

        if (
                companyRepository
                        .existsByNameIgnoreCaseAndOwnerIdAndIdNot(
                                companyName,
                                currentUser.getId(),
                                id
                        )
        ) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Cette entreprise existe déjà"
            );
        }

        company.setName(companyName);

        company.setWebsite(
                clean(request.website())
        );

        company.setLocation(
                clean(request.location())
        );

        company.setIndustry(
                clean(request.industry())
        );

        company.setNotes(
                clean(request.notes())
        );

        Company updatedCompany =
                companyRepository.save(company);

        return toResponse(updatedCompany);
    }

    public void delete(
            Long id,
            AppUser currentUser
    ) {
        Company company =
                findOwnedCompany(
                        id,
                        currentUser.getId()
                );

        long offersCount =
                jobOfferRepository
                        .countByCompanyIdAndOwnerId(
                                id,
                                currentUser.getId()
                        );

        if (offersCount > 0) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Impossible de supprimer cette entreprise car elle contient des offres d'emploi"
            );
        }

        companyRepository.delete(company);
    }

    public Company findOwnedCompany(
            Long companyId,
            Long ownerId
    ) {
        return companyRepository
                .findByIdAndOwnerId(
                        companyId,
                        ownerId
                )
                .orElseThrow(
                        () ->
                                new ResponseStatusException(
                                        HttpStatus.NOT_FOUND,
                                        "Entreprise introuvable"
                                )
                );
    }

    private CompanyResponse toResponse(
            Company company
    ) {
        return new CompanyResponse(
                company.getId(),
                company.getName(),
                company.getWebsite(),
                company.getLocation(),
                company.getIndustry(),
                company.getNotes(),
                company.getCreatedAt(),
                company.getUpdatedAt()
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