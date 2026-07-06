package com.aziz.careerpilot_backend.entity;

import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "job_applications",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_application_offer_owner",
                        columnNames = {
                                "job_offer_id",
                                "owner_id"
                        }
                )
        }
)
public class JobApplication {

    @Id
    @GeneratedValue(
            strategy = GenerationType.IDENTITY
    )
    private Long id;

    @ManyToOne(
            fetch = FetchType.LAZY,
            optional = false
    )
    @JoinColumn(
            name = "job_offer_id",
            nullable = false
    )
    private JobOffer jobOffer;

    @ManyToOne(
            fetch = FetchType.LAZY,
            optional = false
    )
    @JoinColumn(
            name = "owner_id",
            nullable = false
    )
    private AppUser owner;

    @Enumerated(EnumType.STRING)
    @Column(
            nullable = false,
            length = 30
    )
    private ApplicationStatus status;

    private LocalDate appliedDate;

    private LocalDateTime interviewDate;

    private LocalDate nextFollowUpDate;

    @Column(length = 150)
    private String contactName;

    @Column(length = 150)
    private String contactEmail;

    @Column(length = 50)
    private String contactPhone;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(
            nullable = false,
            updatable = false
    )
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    public JobApplication() {
    }

    @PrePersist
    public void beforeInsert() {

        LocalDateTime now =
                LocalDateTime.now();

        createdAt = now;
        updatedAt = now;

        if (status == null) {
            status = ApplicationStatus.SAVED;
        }
    }

    @PreUpdate
    public void beforeUpdate() {

        updatedAt =
                LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(
            Long id
    ) {
        this.id = id;
    }

    public JobOffer getJobOffer() {
        return jobOffer;
    }

    public void setJobOffer(
            JobOffer jobOffer
    ) {
        this.jobOffer = jobOffer;
    }

    public AppUser getOwner() {
        return owner;
    }

    public void setOwner(
            AppUser owner
    ) {
        this.owner = owner;
    }

    public ApplicationStatus getStatus() {
        return status;
    }

    public void setStatus(
            ApplicationStatus status
    ) {
        this.status = status;
    }

    public LocalDate getAppliedDate() {
        return appliedDate;
    }

    public void setAppliedDate(
            LocalDate appliedDate
    ) {
        this.appliedDate = appliedDate;
    }

    public LocalDateTime getInterviewDate() {
        return interviewDate;
    }

    public void setInterviewDate(
            LocalDateTime interviewDate
    ) {
        this.interviewDate = interviewDate;
    }

    public LocalDate getNextFollowUpDate() {
        return nextFollowUpDate;
    }

    public void setNextFollowUpDate(
            LocalDate nextFollowUpDate
    ) {
        this.nextFollowUpDate =
                nextFollowUpDate;
    }

    public String getContactName() {
        return contactName;
    }

    public void setContactName(
            String contactName
    ) {
        this.contactName = contactName;
    }

    public String getContactEmail() {
        return contactEmail;
    }

    public void setContactEmail(
            String contactEmail
    ) {
        this.contactEmail = contactEmail;
    }

    public String getContactPhone() {
        return contactPhone;
    }

    public void setContactPhone(
            String contactPhone
    ) {
        this.contactPhone = contactPhone;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(
            String notes
    ) {
        this.notes = notes;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}