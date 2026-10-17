
package com.ecoconnect.controller;

import com.ecoconnect.entity.WasteListing;
import com.ecoconnect.service.WasteListingService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

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

    @PatchMapping("/{id}/status")
    public WasteListing updateStatus(@PathVariable Long id, @RequestBody java.util.Map<String, String> payload, jakarta.servlet.http.HttpSession session) {
        requireAnyRole(session, "COOPERATIVE_COORDINATOR", "ADMIN");
        String status = payload.getOrDefault("status", "").trim().toUpperCase();
        if (!java.util.Set.of("AVAILABLE", "ACCEPTED", "SCHEDULED", "IN_PROGRESS", "COLLECTED").contains(status)) {
            throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST, "Invalid listing status.");
        }
        return service.updateStatus(id, status);
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
        return service.getAllListings();
    }
}
