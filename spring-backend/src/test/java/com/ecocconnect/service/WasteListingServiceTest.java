package com.ecoconnect.service;

import com.ecoconnect.dto.WasteListingUpdateRequest;
import com.ecoconnect.entity.WasteListing;
import com.ecoconnect.repository.WasteListingRepository;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class WasteListingServiceTest {

    @Mock
    private WasteListingRepository repository;

    @InjectMocks
    private WasteListingService service;

    @Test
    void updatesOwnedAvailableListingWithoutChangingOwnerOrStatus() {
        WasteListing listing = new WasteListing();
        listing.setCreatedByEmail("generator@example.com");
        listing.setStatus("AVAILABLE");
        when(repository.findOwnedByIdAndEmail(12L, "generator@example.com"))
                .thenReturn(Optional.of(listing));
        when(repository.save(listing)).thenReturn(listing);

        WasteListing updated = service.updateGeneratorListing(12L, "generator@example.com",
                new WasteListingUpdateRequest("Food scraps", new BigDecimal("8.5"),
                        "North district", "Ready for pickup", "Sam", "12345678"));

        assertEquals("Food scraps", updated.getWasteType());
        assertEquals(new BigDecimal("8.5"), updated.getQuantityKg());
        assertEquals("North district", updated.getLocation());
        assertEquals("Ready for pickup", updated.getDescription());
        assertEquals("Sam", updated.getContactName());
        assertEquals("12345678", updated.getContactPhone());
        assertEquals("generator@example.com", updated.getCreatedByEmail());
        assertEquals("AVAILABLE", updated.getStatus());
        verify(repository).save(listing);
    }

    @Test
    void fetchesAllOwnedListingsUsingAuthenticatedEmailWithoutStatusFiltering() {
        WasteListing oldCollectedListing = new WasteListing();
        oldCollectedListing.setStatus("COLLECTED");
        when(repository.findAllOwnedByEmail(" generator@example.com "))
                .thenReturn(List.of(oldCollectedListing));

        List<WasteListing> listings = service.getListingsForGenerator(" generator@example.com ");

        assertEquals(1, listings.size());
        assertEquals("COLLECTED", listings.get(0).getStatus());
        verify(repository).findAllOwnedByEmail(" generator@example.com ");
    }

    @Test
    void rejectsEditsWhenListingIsNotOwnedByGenerator() {
        when(repository.findOwnedByIdAndEmail(12L, "other@example.com"))
                .thenReturn(Optional.empty());

        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> service.updateGeneratorListing(12L, "other@example.com",
                        new WasteListingUpdateRequest("Food scraps", new BigDecimal("8.5"),
                                "North district", null, "Sam", "12345678")));

        assertEquals(HttpStatus.NOT_FOUND, exception.getStatusCode());
        verify(repository, never()).delete(org.mockito.ArgumentMatchers.any(WasteListing.class));
        verify(repository, never()).save(org.mockito.ArgumentMatchers.any(WasteListing.class));
    }

    @Test
    void rejectsDeletionWhenListingIsNotOwnedByGenerator() {
        when(repository.findOwnedByIdAndEmail(12L, "other@example.com"))
                .thenReturn(Optional.empty());

        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> service.deleteGeneratorListing(12L, "other@example.com"));

        assertEquals(HttpStatus.NOT_FOUND, exception.getStatusCode());
        verify(repository, never()).delete(org.mockito.ArgumentMatchers.any(WasteListing.class));
    }

    @Test
    void rejectsEditsAndDeletesAfterPickupProcessingStarts() {
        WasteListing listing = new WasteListing();
        listing.setStatus("SCHEDULED");
        when(repository.findOwnedByIdAndEmail(12L, "generator@example.com"))
                .thenReturn(Optional.of(listing));

        WasteListingUpdateRequest request = new WasteListingUpdateRequest("Food scraps",
                new BigDecimal("8.5"), "North district", null, "Sam", "12345678");
        ResponseStatusException updateException = assertThrows(ResponseStatusException.class,
                () -> service.updateGeneratorListing(12L, "generator@example.com", request));
        ResponseStatusException deleteException = assertThrows(ResponseStatusException.class,
                () -> service.deleteGeneratorListing(12L, "generator@example.com"));

        assertEquals(HttpStatus.CONFLICT, updateException.getStatusCode());
        assertEquals(HttpStatus.CONFLICT, deleteException.getStatusCode());
        verify(repository, never()).save(org.mockito.ArgumentMatchers.any(WasteListing.class));
        verify(repository, never()).delete(org.mockito.ArgumentMatchers.any(WasteListing.class));
    }
}
