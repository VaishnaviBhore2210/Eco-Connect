package spring_backend.dto;

import spring_backend.entity.UserRole;

public record UserLoginResponse(Long id, String fullName, String email, UserRole role, String organizationName, String location, String message) {}
