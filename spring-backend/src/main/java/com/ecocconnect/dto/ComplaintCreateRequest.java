package com.ecoconnect.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ComplaintCreateRequest(
        @NotBlank @Size(max = 180) String subject,
        @NotBlank @Size(max = 2000) String details) {
}
