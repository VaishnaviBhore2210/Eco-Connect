
package com.ecoconnect.repository;

import com.ecoconnect.entity.WasteListing;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WasteListingRepository
        extends JpaRepository<WasteListing, Long> {
}
