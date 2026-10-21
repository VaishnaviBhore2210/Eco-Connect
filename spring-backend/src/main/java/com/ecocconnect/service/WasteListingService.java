
package com.ecoconnect.service;

import com.ecoconnect.entity.WasteListing;
import com.ecoconnect.dto.WasteListingUpdateRequest;
import com.ecoconnect.repository.WasteListingRepository;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.Set;

@Service
public class WasteListingService {

    private final WasteListingRepository repository;

    public WasteListingService(WasteListingRepository repository) {
        this.repository = repository;
    }

    public WasteListing createListing(WasteListing listing) {
        return repository.save(listing);
    }

    public WasteListing updateStatus(Long id, String status) {
        WasteListing listing = repository.findById(id)
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.NOT_FOUND, "Waste listing not found."));
        listing.setStatus(status);
        if ("COLLECTED".equals(status) && listing.getCollectedAt() == null) {
            listing.setCollectedAt(LocalDateTime.now());
            listing.setProcessingStatus("RECEIVED");
            listing.setProcessingUpdatedAt(listing.getCollectedAt());
        }
        return repository.save(listing);
    }

    @Transactional
    public WasteListing updateCoordinatorStatus(Long id, String email, String status) {
        WasteListing listing = findListingForCoordinatorUpdate(id);
        String currentStatus = normalize(listing.getStatus());
        String coordinatorEmail = email.trim();

        if ("AVAILABLE".equals(currentStatus) && "ACCEPTED".equals(status)
                && listing.getAssignedCoordinatorEmail() == null) {
            listing.setAssignedCoordinatorEmail(coordinatorEmail);
        } else {
            requireCoordinatorOwnership(listing, coordinatorEmail);
        }

        boolean allowed = switch (currentStatus) {
            case "ACCEPTED" -> Set.of("SCHEDULED", "IN_PROGRESS").contains(status);
            case "SCHEDULED" -> "IN_PROGRESS".equals(status);
            case "IN_PROGRESS" -> "COLLECTED".equals(status);
            default -> false;
        };
        if (!allowed && !("AVAILABLE".equals(currentStatus) && "ACCEPTED".equals(status)
                && coordinatorEmail.equalsIgnoreCase(listing.getAssignedCoordinatorEmail()))) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "This pickup status transition is not allowed.");
        }

        listing.setStatus(status);
        if ("COLLECTED".equals(status)) {
            listing.setCollectedAt(LocalDateTime.now());
            listing.setProcessingStatus("RECEIVED");
            listing.setProcessingUpdatedAt(listing.getCollectedAt());
        }
        return repository.save(listing);
    }

    @Transactional
    public WasteListing scheduleCoordinatorPickup(Long id, String email, LocalDateTime scheduledAt) {
        WasteListing listing = findListingForCoordinatorUpdate(id);
        requireCoordinatorOwnership(listing, email);
        String status = normalize(listing.getStatus());
        if (!Set.of("ACCEPTED", "SCHEDULED").contains(status)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Only accepted pickups can be scheduled or rescheduled.");
        }
        if (!scheduledAt.isAfter(LocalDateTime.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Pickup date and time must be in the future.");
        }
        listing.setScheduledPickupAt(scheduledAt);
        listing.setStatus("SCHEDULED");
        return repository.save(listing);
    }

    @Transactional
    public WasteListing updateProcessingStatus(Long id, String email, String processingStatus) {
        WasteListing listing = findListingForCoordinatorUpdate(id);
        requireCoordinatorOwnership(listing, email);
        if (!Set.of("COLLECTED", "COMPLETED").contains(normalize(listing.getStatus()))) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Only collected pickups can enter waste processing.");
        }

        String current = normalize(listing.getProcessingStatus());
        boolean allowed = current.isEmpty()
                ? "RECEIVED".equals(processingStatus)
                : switch (current) {
                    case "RECEIVED" -> "SORTING".equals(processingStatus);
                    case "SORTING" -> "PROCESSING".equals(processingStatus);
                    case "PROCESSING" -> "PROCESSED".equals(processingStatus);
                    default -> false;
                };
        if (!allowed) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "This waste processing transition is not allowed.");
        }

        listing.setProcessingStatus(processingStatus);
        listing.setProcessingUpdatedAt(LocalDateTime.now());
        return repository.save(listing);
    }

    private WasteListing findListingForCoordinatorUpdate(Long id) {
        return repository.findByIdForUpdate(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Waste listing not found."));
    }

    private void requireCoordinatorOwnership(WasteListing listing, String email) {
        if (listing.getAssignedCoordinatorEmail() == null
                || !listing.getAssignedCoordinatorEmail().trim().equalsIgnoreCase(email.trim())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Pickup not found for this cooperative.");
        }
    }

    private String normalize(String value) {
        return value == null ? "" : value.trim().toUpperCase(Locale.ROOT);
    }

    public WasteListing updateGeneratorListing(Long id, String email, WasteListingUpdateRequest request) {
        WasteListing listing = findEditableListing(id, email);
        listing.setWasteType(request.wasteType().trim());
        listing.setQuantityKg(request.quantityKg());
        listing.setLocation(request.location().trim());
        listing.setDescription(request.description() == null ? null : request.description().trim());
        listing.setContactName(request.contactName().trim());
        listing.setContactPhone(request.contactPhone().trim());
        return repository.save(listing);
    }

    public void deleteGeneratorListing(Long id, String email) {
        repository.delete(findEditableListing(id, email));
    }

    private WasteListing findEditableListing(Long id, String email) {
        WasteListing listing = repository.findOwnedByIdAndEmail(id, email.trim())
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                        org.springframework.http.HttpStatus.NOT_FOUND, "Waste listing not found."));
        String status = listing.getStatus() == null ? "" : listing.getStatus().trim().toUpperCase(Locale.ROOT);
        if (!status.equals("AVAILABLE") && !status.equals("PENDING")) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.CONFLICT,
                    "This listing cannot be edited or deleted after pickup processing has started.");
        }
        return listing;
    }

    public List<WasteListing> getAllListings() {
        return repository.findAll(Sort.by(Sort.Direction.DESC, "createdAt")
                .and(Sort.by(Sort.Direction.DESC, "id")));
    }

    public List<WasteListing> getListingsForCoordinatorDashboard(String email) {
        return repository.findAvailableAndAssignedToCoordinator(email);
    }

    public List<WasteListing> getCoordinatorPickups(String email) {
        return repository.findAllAssignedToCoordinator(email);
    }

    public List<WasteListing> getListingsForGenerator(String email) {
        return repository.findAllOwnedByEmail(email);
    }
}
