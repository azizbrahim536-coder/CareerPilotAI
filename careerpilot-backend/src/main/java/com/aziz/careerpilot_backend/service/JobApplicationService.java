package com.aziz.careerpilot_backend.service;

import com.aziz.careerpilot_backend.dto.ApplicationStatusRequest;
import com.aziz.careerpilot_backend.dto.JobApplicationRequest;
import com.aziz.careerpilot_backend.dto.JobApplicationResponse;

import com.aziz.careerpilot_backend.entity.AppUser;
import com.aziz.careerpilot_backend.entity.ApplicationStatus;
import com.aziz.careerpilot_backend.entity.JobApplication;
import com.aziz.careerpilot_backend.entity.JobOffer;

import com.aziz.careerpilot_backend.repository.JobApplicationRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;

import java.util.ArrayList;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;

@Service
@Transactional
public class JobApplicationService {

    private final JobApplicationRepository
            applicationRepository;

    private final JobOfferService jobOfferService;

    public JobApplicationService(
            JobApplicationRepository applicationRepository,
            JobOfferService jobOfferService
    ) {
        this.applicationRepository =
                applicationRepository;

        this.jobOfferService =
                jobOfferService;
    }

    @Transactional(readOnly = true)
    public List<JobApplicationResponse> getAll(
            ApplicationStatus status,
            AppUser currentUser
    ) {
        List<JobApplication> applications;

        if (status == null) {

            applications =
                    applicationRepository
                            .findAllByOwnerIdOrderByUpdatedAtDesc(
                                    currentUser.getId()
                            );

        } else {

            applications =
                    applicationRepository
                            .findAllByOwnerIdAndStatusOrderByUpdatedAtDesc(
                                    currentUser.getId(),
                                    status
                            );
        }

        return applications
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public Map<ApplicationStatus, List<JobApplicationResponse>>
    getBoard(
            AppUser currentUser
    ) {
        List<JobApplication> applications =
                applicationRepository
                        .findAllByOwnerIdOrderByUpdatedAtDesc(
                                currentUser.getId()
                        );

        Map<ApplicationStatus, List<JobApplicationResponse>>
                board =
                new EnumMap<>(
                        ApplicationStatus.class
                );

        for (
                ApplicationStatus status
                :
                ApplicationStatus.values()
        ) {
            board.put(
                    status,
                    new ArrayList<>()
            );
        }

        for (
                JobApplication application
                :
                applications
        ) {
            board
                    .get(application.getStatus())
                    .add(
                            toResponse(application)
                    );
        }

        return board;
    }

    @Transactional(readOnly = true)
    public JobApplicationResponse getById(
            Long id,
            AppUser currentUser
    ) {
        JobApplication application =
                findOwnedApplication(
                        id,
                        currentUser.getId()
                );

        return toResponse(application);
    }

    public JobApplicationResponse create(
            JobApplicationRequest request,
            AppUser currentUser
    ) {
        boolean alreadyExists =
                applicationRepository
                        .existsByJobOfferIdAndOwnerId(
                                request.jobOfferId(),
                                currentUser.getId()
                        );

        if (alreadyExists) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Une candidature existe déjà pour cette offre"
            );
        }

        JobOffer jobOffer =
                jobOfferService.findOwnedOffer(
                        request.jobOfferId(),
                        currentUser.getId()
                );

        JobApplication application =
                new JobApplication();

        application.setJobOffer(jobOffer);
        application.setOwner(currentUser);

        applyRequest(
                application,
                request
        );

        JobApplication savedApplication =
                applicationRepository.save(
                        application
                );

        return toResponse(savedApplication);
    }

    public JobApplicationResponse update(
            Long id,
            JobApplicationRequest request,
            AppUser currentUser
    ) {
        JobApplication application =
                findOwnedApplication(
                        id,
                        currentUser.getId()
                );

        boolean duplicatedOffer =
                applicationRepository
                        .existsByJobOfferIdAndOwnerIdAndIdNot(
                                request.jobOfferId(),
                                currentUser.getId(),
                                id
                        );

        if (duplicatedOffer) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Une candidature existe déjà pour cette offre"
            );
        }

        JobOffer jobOffer =
                jobOfferService.findOwnedOffer(
                        request.jobOfferId(),
                        currentUser.getId()
                );

        application.setJobOffer(jobOffer);

        applyRequest(
                application,
                request
        );

        JobApplication updatedApplication =
                applicationRepository.save(
                        application
                );

        return toResponse(updatedApplication);
    }

    public JobApplicationResponse updateStatus(
            Long id,
            ApplicationStatusRequest request,
            AppUser currentUser
    ) {
        JobApplication application =
                findOwnedApplication(
                        id,
                        currentUser.getId()
                );

        application.setStatus(
                request.status()
        );

        setDefaultAppliedDate(
                application
        );

        JobApplication updatedApplication =
                applicationRepository.save(
                        application
                );

        return toResponse(updatedApplication);
    }

    public void delete(
            Long id,
            AppUser currentUser
    ) {
        JobApplication application =
                findOwnedApplication(
                        id,
                        currentUser.getId()
                );

        applicationRepository.delete(
                application
        );
    }

    private JobApplication findOwnedApplication(
            Long id,
            Long ownerId
    ) {
        return applicationRepository
                .findByIdAndOwnerId(
                        id,
                        ownerId
                )
                .orElseThrow(
                        () ->
                                new ResponseStatusException(
                                        HttpStatus.NOT_FOUND,
                                        "Candidature introuvable"
                                )
                );
    }

    private void applyRequest(
            JobApplication application,
            JobApplicationRequest request
    ) {
        application.setStatus(
                request.status()
        );

        application.setAppliedDate(
                request.appliedDate()
        );

        application.setInterviewDate(
                request.interviewDate()
        );

        application.setNextFollowUpDate(
                request.nextFollowUpDate()
        );

        application.setContactName(
                clean(request.contactName())
        );

        application.setContactEmail(
                clean(request.contactEmail())
        );

        application.setContactPhone(
                clean(request.contactPhone())
        );

        application.setNotes(
                clean(request.notes())
        );

        setDefaultAppliedDate(
                application
        );
    }

    private void setDefaultAppliedDate(
            JobApplication application
    ) {
        if (
                application.getStatus()
                        != ApplicationStatus.SAVED
                        &&
                        application.getAppliedDate()
                                == null
        ) {
            application.setAppliedDate(
                    LocalDate.now()
            );
        }
    }

    private JobApplicationResponse toResponse(
            JobApplication application
    ) {
        JobOffer jobOffer =
                application.getJobOffer();

        return new JobApplicationResponse(
                application.getId(),
                application.getStatus(),
                application.getAppliedDate(),
                application.getInterviewDate(),
                application.getNextFollowUpDate(),
                application.getContactName(),
                application.getContactEmail(),
                application.getContactPhone(),
                application.getNotes(),

                jobOffer.getId(),
                jobOffer.getTitle(),
                jobOffer.getLocation(),
                jobOffer.getWorkMode(),
                jobOffer.getEmploymentType(),
                jobOffer.getSourceUrl(),

                jobOffer.getCompany().getId(),
                jobOffer.getCompany().getName(),

                application.getCreatedAt(),
                application.getUpdatedAt()
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