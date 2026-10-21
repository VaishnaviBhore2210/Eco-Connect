
package com.ecoconnect.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "waste_listings", indexes = {
        @Index(name = "idx_waste_listings_coordinator", columnList = "assigned_coordinator_email")
})
public class WasteListing {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String wasteType;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal quantityKg;

    @Column(nullable = false)
    private String location;

    @Column(length = 1000)
    private String description;

    @Column(nullable = false)
    private String contactName;

    @Column(nullable = false)
    private String contactPhone;

    @Column(nullable = false)
    private String status = "AVAILABLE";

    // Email of the user who created this waste listing
    @Column(name = "created_by_email")
    private String createdByEmail;

    @Column(name = "assigned_coordinator_email")
    private String assignedCoordinatorEmail;

    private LocalDateTime scheduledPickupAt;

    private LocalDateTime collectedAt;

    private String processingStatus;

    private LocalDateTime processingUpdatedAt;

    private LocalDateTime createdAt;

    public WasteListing() {
    }

    @PrePersist
    public void setCreatedAt() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }

    public Long getId() {
        return id;
    }

    public String getWasteType() {
        return wasteType;
    }

    public void setWasteType(String wasteType) {
        this.wasteType = wasteType;
    }

    public BigDecimal getQuantityKg() {
        return quantityKg;
    }

    public void setQuantityKg(BigDecimal quantityKg) {
        this.quantityKg = quantityKg;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getContactName() {
        return contactName;
    }

    public void setContactName(String contactName) {
        this.contactName = contactName;
    }

    public String getContactPhone() {
        return contactPhone;
    }

    public void setContactPhone(String contactPhone) {
        this.contactPhone = contactPhone;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getCreatedByEmail() {
        return createdByEmail;
    }

    public void setCreatedByEmail(String createdByEmail) {
        this.createdByEmail = createdByEmail;
    }

    public String getAssignedCoordinatorEmail() {
        return assignedCoordinatorEmail;
    }

    public void setAssignedCoordinatorEmail(String assignedCoordinatorEmail) {
        this.assignedCoordinatorEmail = assignedCoordinatorEmail;
    }

    public LocalDateTime getScheduledPickupAt() {
        return scheduledPickupAt;
    }

    public void setScheduledPickupAt(LocalDateTime scheduledPickupAt) {
        this.scheduledPickupAt = scheduledPickupAt;
    }

    public LocalDateTime getCollectedAt() {
        return collectedAt;
    }

    public void setCollectedAt(LocalDateTime collectedAt) {
        this.collectedAt = collectedAt;
    }

    public String getProcessingStatus() {
        return processingStatus;
    }

    public void setProcessingStatus(String processingStatus) {
        this.processingStatus = processingStatus;
    }

    public LocalDateTime getProcessingUpdatedAt() {
        return processingUpdatedAt;
    }

    public void setProcessingUpdatedAt(LocalDateTime processingUpdatedAt) {
        this.processingUpdatedAt = processingUpdatedAt;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
