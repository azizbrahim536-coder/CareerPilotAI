package com.aziz.careerpilot_backend.repository;

import com.aziz.careerpilot_backend.entity.Company;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CompanyRepository
        extends JpaRepository<Company, Long> {

    List<Company> findAllByOwnerIdOrderByNameAsc(
            Long ownerId
    );

    Optional<Company> findByIdAndOwnerId(
            Long id,
            Long ownerId
    );

    boolean existsByNameIgnoreCaseAndOwnerId(
            String name,
            Long ownerId
    );

    boolean existsByNameIgnoreCaseAndOwnerIdAndIdNot(
            String name,
            Long ownerId,
            Long id
    );
}