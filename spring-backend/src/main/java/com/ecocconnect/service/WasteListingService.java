
package com.ecoconnect.service;

import com.ecoconnect.entity.WasteListing;
import com.ecoconnect.repository.WasteListingRepository;
import org.springframework.stereotype.Service;

import java.util.List;

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

    public List<WasteListing> getAllListings() {
        return repository.findAll();
    }
}
