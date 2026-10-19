
package com.ecoconnect.repository;

import com.ecoconnect.entity.WasteListing;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

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
}
