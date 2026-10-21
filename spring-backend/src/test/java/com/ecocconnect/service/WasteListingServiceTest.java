package com.ecoconnect.service;

import com.ecoconnect.dto.WasteListingUpdateRequest;
import com.ecoconnect.entity.WasteListing;
import com.ecoconnect.repository.WasteListingRepository;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.data.domain.Sort;
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
    void fetchesAllPlatformListingsWithoutOwnerOrStatusFiltering() {
        WasteListing collectedListing = new WasteListing();
        collectedListing.setStatus("COLLECTED");
        WasteListing availableListing = new WasteListing();
        availableListing.setStatus("AVAILABLE");
        List<WasteListing> platformListings = List.of(collectedListing, availableListing);
        when(repository.findAll(org.mockito.ArgumentMatchers.any(Sort.class)))
                .thenReturn(platformListings);

        List<WasteListing> listings = service.getAllListings();

        assertEquals(platformListings, listings);
        assertEquals(List.of("COLLECTED", "AVAILABLE"),
                listings.stream().map(WasteListing::getStatus).toList());
        verify(repository).findAll(org.mockito.ArgumentMatchers.any(Sort.class));
        verify(repository, never()).findAllOwnedByEmail(org.mockito.ArgumentMatchers.anyString());
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

    @Test
    void coordinatorAcceptsAvailableListingAndOwnsIt() {
        WasteListing listing = new WasteListing();
        listing.setStatus("AVAILABLE");
        when(repository.findByIdForUpdate(12L)).thenReturn(Optional.of(listing));
        when(repository.save(listing)).thenReturn(listing);

        WasteListing updated = service.updateCoordinatorStatus(12L, "coordinator@example.com", "ACCEPTED");

        assertEquals("ACCEPTED", updated.getStatus());
        assertEquals("coordinator@example.com", updated.getAssignedCoordinatorEmail());
        verify(repository).save(listing);
    }

    @Test
    void coordinatorCannotUpdateAnotherCooperativesPickup() {
        WasteListing listing = new WasteListing();
        listing.setStatus("ACCEPTED");
        listing.setAssignedCoordinatorEmail("owner@example.com");
        when(repository.findByIdForUpdate(12L)).thenReturn(Optional.of(listing));

        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> service.updateCoordinatorStatus(12L, "other@example.com", "IN_PROGRESS"));

        assertEquals(HttpStatus.NOT_FOUND, exception.getStatusCode());
        verify(repository, never()).save(listing);
    }

    @Test
    void schedulingAcceptedPickupPersistsDateAndScheduledStatus() {
        WasteListing listing = new WasteListing();
        listing.setStatus("ACCEPTED");
        listing.setAssignedCoordinatorEmail("coordinator@example.com");
        LocalDateTime scheduledAt = LocalDateTime.now().plusDays(1);
        when(repository.findByIdForUpdate(12L)).thenReturn(Optional.of(listing));
        when(repository.save(listing)).thenReturn(listing);

        WasteListing updated = service.scheduleCoordinatorPickup(12L, "coordinator@example.com", scheduledAt);

        assertEquals("SCHEDULED", updated.getStatus());
        assertEquals(scheduledAt, updated.getScheduledPickupAt());
        verify(repository).save(listing);
    }

    @Test
    void rejectsPastPickupSchedule() {
        WasteListing listing = new WasteListing();
        listing.setStatus("ACCEPTED");
        listing.setAssignedCoordinatorEmail("coordinator@example.com");
        when(repository.findByIdForUpdate(12L)).thenReturn(Optional.of(listing));

        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> service.scheduleCoordinatorPickup(12L, "coordinator@example.com", LocalDateTime.now().minusMinutes(1)));

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
        verify(repository, never()).save(listing);
    }

    @Test
    void cannotStartProcessingBeforePickupIsCollected() {
        WasteListing listing = new WasteListing();
        listing.setStatus("IN_PROGRESS");
        listing.setAssignedCoordinatorEmail("coordinator@example.com");
        when(repository.findByIdForUpdate(12L)).thenReturn(Optional.of(listing));

        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> service.updateProcessingStatus(12L, "coordinator@example.com", "RECEIVED"));

        assertEquals(HttpStatus.CONFLICT, exception.getStatusCode());
        verify(repository, never()).save(listing);
    }

    @Test
    void processingStagesAdvanceWithoutChangingPickupStatus() {
        WasteListing listing = new WasteListing();
        listing.setStatus("COLLECTED");
        listing.setAssignedCoordinatorEmail("coordinator@example.com");
        listing.setProcessingStatus("SORTING");
        when(repository.findByIdForUpdate(12L)).thenReturn(Optional.of(listing));
        when(repository.save(listing)).thenReturn(listing);

        WasteListing updated = service.updateProcessingStatus(12L, "coordinator@example.com", "PROCESSING");

        assertEquals("PROCESSING", updated.getProcessingStatus());
        assertEquals("COLLECTED", updated.getStatus());
        verify(repository).save(listing);
    }
}
