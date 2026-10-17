package spring_backend.dto;

import java.time.LocalDateTime;
import spring_backend.entity.UserRole;

public record UserRegistrationResponse(
        Long id,
        String fullName,
        String email,
        UserRole role,
        String organizationName,
        String location,
        LocalDateTime createdAt,
        String message
) {}
