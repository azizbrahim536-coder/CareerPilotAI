package com.aziz.careerpilot_backend.service;

import com.aziz.careerpilot_backend.dto.DashboardApplicationItem;
import com.aziz.careerpilot_backend.dto.DashboardStatisticsResponse;

import com.aziz.careerpilot_backend.entity.AppUser;
import com.aziz.careerpilot_backend.entity.ApplicationStatus;
import com.aziz.careerpilot_backend.entity.JobApplication;
import com.aziz.careerpilot_backend.entity.JobOffer;

import com.aziz.careerpilot_backend.repository.JobApplicationRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;

import java.util.EnumMap;
import java.util.List;
import java.util.Map;

@Service
@Transactional(readOnly = true)
public class DashboardService {

    private final JobApplicationRepository applicationRepository;

    public DashboardService(
            JobApplicationRepository applicationRepository
    ) {
        this.applicationRepository = applicationRepository;
    }

    public DashboardStatisticsResponse getStatistics(
            AppUser currentUser
    ) {
        Long ownerId = currentUser.getId();

        long totalApplications =
                applicationRepository.countByOwnerId(ownerId);

        long savedApplications =
                applicationRepository.countByOwnerIdAndStatus(
                        ownerId,
                        ApplicationStatus.SAVED
                );

        long appliedApplications =
                applicationRepository.countByOwnerIdAndStatus(
                        ownerId,
                        ApplicationStatus.APPLIED
                );

        long interviewApplications =
                applicationRepository.countByOwnerIdAndStatus(
                        ownerId,
                        ApplicationStatus.INTERVIEW
                );

        long offerApplications =
                applicationRepository.countByOwnerIdAndStatus(
                        ownerId,
                        ApplicationStatus.OFFER
                );

        long rejectedApplications =
                applicationRepository.countByOwnerIdAndStatus(
                        ownerId,
                        ApplicationStatus.REJECTED
                );

        long activeApplications =
                savedApplications
                        + appliedApplications
                        + interviewApplications;

        YearMonth currentMonth = YearMonth.now();

        LocalDateTime monthStart =
                currentMonth
                        .atDay(1)
                        .atStartOfDay();

        LocalDateTime nextMonthStart =
                currentMonth
                        .plusMonths(1)
                        .atDay(1)
                        .atStartOfDay();

        long applicationsThisMonth =
                applicationRepository
                        .countByOwnerIdAndCreatedAtBetween(
                                ownerId,
                                monthStart,
                                nextMonthStart
                        );

        long submittedApplications =
                appliedApplications
                        + interviewApplications
                        + offerApplications
                        + rejectedApplications;

        long answeredApplications =
                interviewApplications
                        + offerApplications
                        + rejectedApplications;

        double responseRate =
                calculatePercentage(
                        answeredApplications,
                        submittedApplications
                );

        double offerRate =
                calculatePercentage(
                        offerApplications,
                        submittedApplications
                );

        Map<ApplicationStatus, Long> statusDistribution =
                createStatusDistribution(
                        savedApplications,
                        appliedApplications,
                        interviewApplications,
                        offerApplications,
                        rejectedApplications
                );

        List<DashboardApplicationItem> upcomingInterviews =
                applicationRepository
                        .findTop5ByOwnerIdAndStatusAndInterviewDateGreaterThanEqualOrderByInterviewDateAsc(
                                ownerId,
                                ApplicationStatus.INTERVIEW,
                                LocalDateTime.now()
                        )
                        .stream()
                        .map(this::toDashboardItem)
                        .toList();

        List<ApplicationStatus> activeStatuses =
                List.of(
                        ApplicationStatus.SAVED,
                        ApplicationStatus.APPLIED,
                        ApplicationStatus.INTERVIEW
                );

        List<DashboardApplicationItem> upcomingFollowUps =
                applicationRepository
                        .findTop5ByOwnerIdAndStatusInAndNextFollowUpDateGreaterThanEqualOrderByNextFollowUpDateAsc(
                                ownerId,
                                activeStatuses,
                                LocalDate.now()
                        )
                        .stream()
                        .map(this::toDashboardItem)
                        .toList();

        List<DashboardApplicationItem> recentApplications =
                applicationRepository
                        .findTop5ByOwnerIdOrderByUpdatedAtDesc(
                                ownerId
                        )
                        .stream()
                        .map(this::toDashboardItem)
                        .toList();

        return new DashboardStatisticsResponse(
                totalApplications,
                savedApplications,
                appliedApplications,
                interviewApplications,
                offerApplications,
                rejectedApplications,
                activeApplications,
                applicationsThisMonth,
                responseRate,
                offerRate,
                statusDistribution,
                upcomingInterviews,
                upcomingFollowUps,
                recentApplications
        );
    }

    private Map<ApplicationStatus, Long> createStatusDistribution(
            long saved,
            long applied,
            long interview,
            long offer,
            long rejected
    ) {
        Map<ApplicationStatus, Long> distribution =
                new EnumMap<>(ApplicationStatus.class);

        distribution.put(
                ApplicationStatus.SAVED,
                saved
        );

        distribution.put(
                ApplicationStatus.APPLIED,
                applied
        );

        distribution.put(
                ApplicationStatus.INTERVIEW,
                interview
        );

        distribution.put(
                ApplicationStatus.OFFER,
                offer
        );

        distribution.put(
                ApplicationStatus.REJECTED,
                rejected
        );

        return distribution;
    }

    private double calculatePercentage(
            long value,
            long total
    ) {
        if (total == 0) {
            return 0.0;
        }

        double percentage =
                value * 100.0 / total;

        return Math.round(
                percentage * 100.0
        ) / 100.0;
    }

    private DashboardApplicationItem toDashboardItem(
            JobApplication application
    ) {
        JobOffer jobOffer =
                application.getJobOffer();

        return new DashboardApplicationItem(
                application.getId(),
                application.getStatus(),

                jobOffer.getId(),
                jobOffer.getTitle(),

                jobOffer.getCompany().getId(),
                jobOffer.getCompany().getName(),

                jobOffer.getLocation(),

                application.getAppliedDate(),
                application.getInterviewDate(),
                application.getNextFollowUpDate(),
                application.getUpdatedAt()
        );
    }
}