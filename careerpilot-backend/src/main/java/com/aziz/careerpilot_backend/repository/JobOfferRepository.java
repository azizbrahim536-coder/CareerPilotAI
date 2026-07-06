package com.aziz.careerpilot_backend.repository;

import com.aziz.careerpilot_backend.entity.JobOffer;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface JobOfferRepository
        extends JpaRepository<JobOffer, Long> {

    List<JobOffer>
    findAllByOwnerIdOrderByCreatedAtDesc(
            Long ownerId
    );

    List<JobOffer>
    findAllByOwnerIdAndCompanyIdOrderByCreatedAtDesc(
            Long ownerId,
            Long companyId
    );

    Optional<JobOffer> findByIdAndOwnerId(
            Long id,
            Long ownerId
    );

    long countByCompanyIdAndOwnerId(
            Long companyId,
            Long ownerId
    );
}