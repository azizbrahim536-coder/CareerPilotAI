package com.aziz.careerpilot_backend.repository;

import com.aziz.careerpilot_backend.entity.ApplicationStatus;
import com.aziz.careerpilot_backend.entity.JobApplication;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface JobApplicationRepository
        extends JpaRepository<JobApplication, Long> {

    List<JobApplication>
    findAllByOwnerIdOrderByUpdatedAtDesc(
            Long ownerId
    );

    List<JobApplication>
    findAllByOwnerIdAndStatusOrderByUpdatedAtDesc(
            Long ownerId,
            ApplicationStatus status
    );

    Optional<JobApplication>
    findByIdAndOwnerId(
            Long id,
            Long ownerId
    );

    boolean existsByJobOfferIdAndOwnerId(
            Long jobOfferId,
            Long ownerId
    );

    boolean existsByJobOfferIdAndOwnerIdAndIdNot(
            Long jobOfferId,
            Long ownerId,
            Long id
    );

    long countByOwnerIdAndStatus(
            Long ownerId,
            ApplicationStatus status
    );
}