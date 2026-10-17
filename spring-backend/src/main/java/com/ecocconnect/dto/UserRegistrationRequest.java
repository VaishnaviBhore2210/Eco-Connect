package spring_backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import spring_backend.entity.UserRole;

public record UserRegistrationRequest(
        @NotBlank(message = "Full name is required")
        @Size(max = 100, message = "Full name must be 100 characters or fewer")
        String fullName,

        @NotBlank(message = "Email is required")
        @Email(message = "Enter a valid email address")
        @Size(max = 190, message = "Email must be 190 characters or fewer")
        String email,

        @NotBlank(message = "Password is required")
        @Size(min = 8, max = 72, message = "Password must be between 8 and 72 characters")
        String password,

        @NotNull(message = "Select a user role")
        UserRole role,

        @Size(max = 150, message = "Organization name must be 150 characters or fewer")
        String organizationName,

        @Size(max = 180, message = "Location must be 180 characters or fewer")
        String location,

        String adminRegistrationKey
) {}
