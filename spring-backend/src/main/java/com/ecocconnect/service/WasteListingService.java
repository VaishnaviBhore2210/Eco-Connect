
package com.ecoconnect.service;

import com.ecoconnect.entity.WasteListing;
import com.ecoconnect.dto.WasteListingUpdateRequest;
import com.ecoconnect.repository.WasteListingRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Locale;

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
        return repository.save(listing);
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
        return repository.findAll();
    }

    public List<WasteListing> getListingsForGenerator(String email) {
        return repository.findAllOwnedByEmail(email);
    }
}
