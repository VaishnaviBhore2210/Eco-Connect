package com.ecoconnect.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public record WasteListingUpdateRequest(
        @NotBlank @Size(max = 255) String wasteType,
        @NotNull @DecimalMin("0.1") BigDecimal quantityKg,
        @NotBlank @Size(max = 255) String location,
        @Size(max = 1000) String description,
        @NotBlank @Size(max = 255) String contactName,
        @NotBlank @Size(min = 8, max = 20) String contactPhone) {
}
