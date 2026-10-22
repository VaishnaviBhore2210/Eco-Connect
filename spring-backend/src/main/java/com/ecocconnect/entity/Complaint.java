package com.ecoconnect.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.time.LocalDateTime;

@Entity
@Table(name = "complaints")
public class Complaint {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 180)
    private String subject;

    @Column(nullable = false, length = 2000)
    private String details;

    @Column(name = "reporter_name", nullable = false, length = 100)
    private String reporterName;

    @Column(name = "reporter_email", nullable = false, length = 190)
    private String reporterEmail;

    @Column(nullable = false, length = 20)
    private String status = "OPEN";

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    protected Complaint() {
    }

    public Complaint(String subject, String details, String reporterName, String reporterEmail) {
        this.subject = subject;
        this.details = details;
        this.reporterName = reporterName;
        this.reporterEmail = reporterEmail;
    }

    @PrePersist
    void setCreatedAt() {
        if (createdAt == null) createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public String getSubject() { return subject; }
    public String getDetails() { return details; }
    public String getReporterName() { return reporterName; }
    public String getReporterEmail() { return reporterEmail; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
