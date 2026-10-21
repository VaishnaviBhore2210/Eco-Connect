
package com.ecoconnect.controller;

import com.ecoconnect.dto.WasteListingUpdateRequest;
import com.ecoconnect.entity.WasteListing;
import com.ecoconnect.service.WasteListingService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/waste-listings")
public class WasteListingController {

    private final WasteListingService service;

    public WasteListingController(WasteListingService service) {
        this.service = service;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public WasteListing createListing(@RequestBody WasteListing listing,
            jakarta.servlet.http.HttpSession session) {
        requireRole(session, "URBAN_WASTE_GENERATOR");
        listing.setCreatedByEmail((String) session.getAttribute("ecoconnectEmail"));
        listing.setStatus("AVAILABLE");
        return service.createListing(listing);
    }

    @PutMapping("/{id}")
    public WasteListing updateGeneratorListing(@PathVariable Long id,
            @Valid @RequestBody WasteListingUpdateRequest request,
            jakarta.servlet.http.HttpSession session) {
        requireRole(session, "URBAN_WASTE_GENERATOR");
        return service.updateGeneratorListing(id, requireGeneratorEmail(session), request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGeneratorListing(@PathVariable Long id,
            jakarta.servlet.http.HttpSession session) {
        requireRole(session, "URBAN_WASTE_GENERATOR");
        service.deleteGeneratorListing(id, requireGeneratorEmail(session));
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/status")
    public WasteListing updateStatus(@PathVariable Long id, @RequestBody java.util.Map<String, String> payload, jakarta.servlet.http.HttpSession session) {
        requireAnyRole(session, "COOPERATIVE_COORDINATOR", "ADMIN");
        String status = payload.getOrDefault("status", "").trim().toUpperCase();
        if (!java.util.Set.of("AVAILABLE", "ACCEPTED", "SCHEDULED", "IN_PROGRESS", "COLLECTED").contains(status)) {
            throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST, "Invalid listing status.");
        }
        if ("COOPERATIVE_COORDINATOR".equals(session.getAttribute("ecoconnectRole"))) {
            return service.updateCoordinatorStatus(id, requireCoordinatorEmail(session), status);
        }
        return service.updateStatus(id, status);
    }

    @GetMapping("/cooperative/pickups")
    public List<WasteListing> getCoordinatorPickups(jakarta.servlet.http.HttpSession session) {
        requireRole(session, "COOPERATIVE_COORDINATOR");
        return service.getCoordinatorPickups(requireCoordinatorEmail(session));
    }

    @PatchMapping("/cooperative/pickups/{id}/schedule")
    public WasteListing schedulePickup(@PathVariable Long id,
            @Valid @RequestBody PickupScheduleRequest request,
            jakarta.servlet.http.HttpSession session) {
        requireRole(session, "COOPERATIVE_COORDINATOR");
        return service.scheduleCoordinatorPickup(
                id, requireCoordinatorEmail(session), request.scheduledPickupAt());
    }

    @PatchMapping("/cooperative/pickups/{id}/processing")
    public WasteListing updateProcessingStatus(@PathVariable Long id,
            @Valid @RequestBody ProcessingStatusRequest request,
            jakarta.servlet.http.HttpSession session) {
        requireRole(session, "COOPERATIVE_COORDINATOR");
        return service.updateProcessingStatus(
                id, requireCoordinatorEmail(session), request.processingStatus().trim().toUpperCase());
    }

    private void requireRole(jakarta.servlet.http.HttpSession session, String expectedRole) {
        Object role = session.getAttribute("ecoconnectRole");
        if (!expectedRole.equals(role)) {
            throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.FORBIDDEN,
                    "You do not have permission to perform this action. Please sign in with the correct account.");
        }
    }

    private void requireAnyRole(jakarta.servlet.http.HttpSession session, String... expectedRoles) {
        Object role = session.getAttribute("ecoconnectRole");
        for (String expectedRole : expectedRoles) if (expectedRole.equals(role)) return;
        throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.FORBIDDEN,
                "You do not have permission to update this listing.");
    }

    @GetMapping
    public List<WasteListing> getAllListings(jakarta.servlet.http.HttpSession session) {
        requireAnyRole(session, "URBAN_WASTE_GENERATOR", "COOPERATIVE_COORDINATOR", "ADMIN");
        if ("COOPERATIVE_COORDINATOR".equals(session.getAttribute("ecoconnectRole"))) {
            return service.getListingsForCoordinatorDashboard(requireCoordinatorEmail(session));
        }
        return service.getAllListings();
    }

    @GetMapping("/mine")
    public List<WasteListing> getMyListings(jakarta.servlet.http.HttpSession session) {
        requireRole(session, "URBAN_WASTE_GENERATOR");
        return service.getListingsForGenerator(requireGeneratorEmail(session));
    }

    private String requireGeneratorEmail(jakarta.servlet.http.HttpSession session) {
        String email = (String) session.getAttribute("ecoconnectEmail");
        if (email == null || email.isBlank()) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.UNAUTHORIZED,
                    "Please sign in to manage your waste listings.");
        }
        return email;
    }

    private String requireCoordinatorEmail(jakarta.servlet.http.HttpSession session) {
        String email = (String) session.getAttribute("ecoconnectEmail");
        if (email == null || email.isBlank()) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.UNAUTHORIZED,
                    "Please sign in to manage cooperative pickups.");
        }
        return email;
    }

    public record PickupScheduleRequest(@NotNull @Future LocalDateTime scheduledPickupAt) {}

    public record ProcessingStatusRequest(
            @NotBlank @Pattern(regexp = "(?i)RECEIVED|SORTING|PROCESSING|PROCESSED") String processingStatus) {}
}
