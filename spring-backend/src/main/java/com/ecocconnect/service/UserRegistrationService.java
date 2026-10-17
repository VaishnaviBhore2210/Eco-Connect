package spring_backend.service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import spring_backend.dto.UserRegistrationRequest;
import spring_backend.dto.UserRegistrationResponse;
import spring_backend.dto.UserLoginRequest;
import spring_backend.dto.UserLoginResponse;
import spring_backend.entity.UserAccount;
import spring_backend.entity.UserRole;
import spring_backend.repository.UserAccountRepository;

@Service
public class UserRegistrationService {

    private final UserAccountRepository userAccountRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    private final String adminRegistrationKey;
    private final String adminEmail;
    private final String adminPassword;

    public UserRegistrationService(
            UserAccountRepository userAccountRepository,
            @Value("${app.admin-registration-key:}") String adminRegistrationKey,
            @Value("${app.admin.email:admin@ecoconnect.com}") String adminEmail,
            @Value("${app.admin.password:ChangeMe@123}") String adminPassword) {
        this.userAccountRepository = userAccountRepository;
        this.adminRegistrationKey = adminRegistrationKey;
        this.adminEmail = adminEmail.trim().toLowerCase();
        this.adminPassword = adminPassword;
    }

    @Transactional
    public UserRegistrationResponse register(UserRegistrationRequest request) {
        String normalizedEmail = request.email().trim().toLowerCase();
        String fullName = request.fullName().trim();

        if (userAccountRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "An account with this email already exists.");
        }

        if (request.role() == UserRole.ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Admin accounts cannot be created through public registration. Use the authorized admin login.");
        }

        if (request.location() == null || request.location().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Location is required.");
        }

        String organizationName = cleanOptional(request.organizationName());
        String location = cleanOptional(request.location());

        if (request.role() == UserRole.COOPERATIVE_COORDINATOR
                && (organizationName == null || location == null)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Cooperative coordinators must provide an organization name and location.");
        }

        UserAccount account = new UserAccount(
                fullName,
                normalizedEmail,
                passwordEncoder.encode(request.password()),
                request.role(),
                organizationName,
                location
        );

        try {
            UserAccount saved = userAccountRepository.saveAndFlush(account);
            return new UserRegistrationResponse(
                    saved.getId(), saved.getFullName(), saved.getEmail(), saved.getRole(),
                    saved.getOrganizationName(), saved.getLocation(), saved.getCreatedAt(),
                    "Registration successful. Your account details have been saved."
            );
        } catch (DataIntegrityViolationException exception) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "An account with this email already exists.");
        }
    }

    @Transactional(readOnly = true)
    public UserLoginResponse login(UserLoginRequest request) {
        String email = request.email().trim().toLowerCase();
        if (email.equals(adminEmail) && MessageDigest.isEqual(
                adminPassword.getBytes(StandardCharsets.UTF_8), request.password().getBytes(StandardCharsets.UTF_8))) {
            return new UserLoginResponse(0L, "EcoConnect Administrator", adminEmail, UserRole.ADMIN,
                    null, null, "Login successful.");
        }

        UserAccount account = userAccountRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password."));
        if (account.getRole() == UserRole.ADMIN || !passwordEncoder.matches(request.password(), account.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password.");
        }
        return new UserLoginResponse(account.getId(), account.getFullName(), account.getEmail(), account.getRole(),
                account.getOrganizationName(), account.getLocation(), "Login successful.");
    }

    private void validateAdminRegistrationKey(String suppliedKey) {
        if (adminRegistrationKey.isBlank() || suppliedKey == null || suppliedKey.isBlank()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Admin registration requires a valid admin registration key.");
        }

        boolean matches = MessageDigest.isEqual(
                adminRegistrationKey.getBytes(StandardCharsets.UTF_8),
                suppliedKey.getBytes(StandardCharsets.UTF_8));
        if (!matches) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "The admin registration key is invalid.");
        }
    }

    private String cleanOptional(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }
}
