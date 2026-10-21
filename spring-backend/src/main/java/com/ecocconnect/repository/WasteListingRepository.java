
package com.ecoconnect.repository;

import com.ecoconnect.entity.WasteListing;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface WasteListingRepository
        extends JpaRepository<WasteListing, Long> {
    @Query("""
            SELECT listing
            FROM WasteListing listing
            WHERE LOWER(TRIM(listing.createdByEmail)) = LOWER(TRIM(:email))
            ORDER BY listing.createdAt DESC, listing.id DESC
            """)
    List<WasteListing> findAllOwnedByEmail(@Param("email") String email);

    @Query("""
            SELECT listing
            FROM WasteListing listing
            WHERE listing.id = :id
              AND LOWER(TRIM(listing.createdByEmail)) = LOWER(TRIM(:email))
            """)
    java.util.Optional<WasteListing> findOwnedByIdAndEmail(@Param("id") Long id, @Param("email") String email);

    @Query("""
            SELECT listing
            FROM WasteListing listing
            WHERE UPPER(listing.status) IN ('AVAILABLE', 'PENDING')
               OR LOWER(TRIM(listing.assignedCoordinatorEmail)) = LOWER(TRIM(:email))
            ORDER BY listing.createdAt DESC, listing.id DESC
            """)
    List<WasteListing> findAvailableAndAssignedToCoordinator(@Param("email") String email);

    @Query("""
            SELECT listing
            FROM WasteListing listing
            WHERE LOWER(TRIM(listing.assignedCoordinatorEmail)) = LOWER(TRIM(:email))
            ORDER BY listing.createdAt DESC, listing.id DESC
            """)
    List<WasteListing> findAllAssignedToCoordinator(@Param("email") String email);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT listing FROM WasteListing listing WHERE listing.id = :id")
    Optional<WasteListing> findByIdForUpdate(@Param("id") Long id);
}
