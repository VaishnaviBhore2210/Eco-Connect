
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
    public WasteListing createListing(
            @RequestBody WasteListing listing) {
        return service.createListing(listing);
    }

    @GetMapping
    public List<WasteListing> getAllListings() {
        return service.getAllListings();
    }
}
