package com.ecoconnect.controller;

import com.ecoconnect.dto.ComplaintCreateRequest;
import com.ecoconnect.entity.Complaint;
import com.ecoconnect.entity.WasteListing;
import com.ecoconnect.repository.ComplaintRepository;
import com.ecoconnect.service.WasteListingService;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import java.util.List;
import java.util.Locale;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import spring_backend.entity.UserAccount;
import spring_backend.entity.UserRole;
import spring_backend.repository.UserAccountRepository;

@RestController
public class AdminOperationsController {

    private final UserAccountRepository userRepository;
    private final WasteListingService listingService;
    private final ComplaintRepository complaintRepository;

    public AdminOperationsController(
            UserAccountRepository userRepository,
            WasteListingService listingService,
            ComplaintRepository complaintRepository) {
        this.userRepository = userRepository;
        this.listingService = listingService;
        this.complaintRepository = complaintRepository;
    }

    @GetMapping("/api/admin/cooperative-approvals")
    public List<CooperativeApproval> getCooperativeApprovals(HttpSession session) {
        requireAdmin(session);
        return userRepository.findAllByRoleOrderByCreatedAtDesc(UserRole.COOPERATIVE_COORDINATOR)
                .stream()
                .map(account -> new CooperativeApproval(
                        account.getId(),
                        account.getOrganizationName(),
                        account.getEmail(),
                        account.getLocation(),
                        normalizeApprovalStatus(account.getApprovalStatus()),
                        account.getCreatedAt()))
                .toList();
    }

    @PatchMapping("/api/admin/cooperative-approvals/{id}")
    public CooperativeApproval updateCooperativeApproval(
            @PathVariable Long id,
            @Valid @RequestBody ApprovalStatusUpdate update,
            HttpSession session) {
        requireAdmin(session);
        String status = normalizeStatus(update.status());
        if (!List.of("APPROVED", "REJECTED").contains(status)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Approval status must be Approved or Rejected.");
        }

        UserAccount account = userRepository.findById(id)
                .filter(user -> user.getRole() == UserRole.COOPERATIVE_COORDINATOR)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cooperative request not found."));
        account.setApprovalStatus(status);
        UserAccount saved = userRepository.save(account);
        return new CooperativeApproval(saved.getId(), saved.getOrganizationName(), saved.getEmail(),
                saved.getLocation(), status, saved.getCreatedAt());
    }

    @GetMapping("/api/admin/pickups")
    public List<WasteListing> getPickups(HttpSession session) {
        requireAdmin(session);
        return listingService.getAllListings();
    }
    @GetMapping("/api/admin/users")
    public AdminUsersResponse getAdminUsers(HttpSession session) {
    requireAdmin(session);

    List<AdminUser> urbanGenerators =
            userRepository.findAllByRoleOrderByCreatedAtDesc(
                    UserRole.URBAN_WASTE_GENERATOR)
                    .stream()
                    .map(account -> new AdminUser(
                            account.getId(),
                            account.getFullName(),
                            account.getEmail(),
                            account.getLocation()))
                    .toList();

    List<AdminUser> cooperatives =
            userRepository.findAllByRoleOrderByCreatedAtDesc(
                    UserRole.COOPERATIVE_COORDINATOR)
                    .stream()
                    .map(account -> new AdminUser(
                            account.getId(),
                            account.getFullName(),
                            account.getEmail(),
                            account.getLocation()))
                    .toList();

    return new AdminUsersResponse(
            urbanGenerators.size(),
            cooperatives.size(),
            urbanGenerators,
            cooperatives);
}

    @PostMapping("/api/complaints")
    public Complaint createComplaint(@Valid @RequestBody ComplaintCreateRequest request, HttpSession session) {
        Object role = session.getAttribute("ecoconnectRole");
        if (!List.of("URBAN_WASTE_GENERATOR", "COOPERATIVE_COORDINATOR", "ADMIN").contains(role)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Please sign in to submit a complaint.");
        }
        String email = (String) session.getAttribute("ecoconnectEmail");
        String fullName = (String) session.getAttribute("ecoconnectFullName");
        if (email == null || email.isBlank() || fullName == null || fullName.isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Your account session is incomplete. Please sign in again.");
        }
        return complaintRepository.save(new Complaint(
                request.subject().trim(),
                request.details().trim(),
                fullName.trim(),
                email.trim()));
    }

    @GetMapping("/api/complaints")
    public List<Complaint> getComplaints(HttpSession session) {
        requireAdmin(session);
        return complaintRepository.findAllByOrderByCreatedAtDescIdDesc();
    }

    @PatchMapping("/api/complaints/{id}/status")
    public Complaint updateComplaintStatus(
            @PathVariable Long id,
            @Valid @RequestBody ComplaintStatusUpdate update,
            HttpSession session) {
        requireAdmin(session);
        String status = normalizeStatus(update.status());
        if (!List.of("OPEN", "IN_PROGRESS", "RESOLVED").contains(status)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Complaint status must be Open, In Progress, or Resolved.");
        }
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Complaint not found."));
        complaint.setStatus(status);
        return complaintRepository.save(complaint);
    }

    private void requireAdmin(HttpSession session) {
        if (!UserRole.ADMIN.name().equals(session.getAttribute("ecoconnectRole"))) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Administrator access is required.");
        }
    }

    private String normalizeApprovalStatus(String status) {
        return status == null || status.isBlank() ? "PENDING" : status.trim().toUpperCase(Locale.ROOT);
    }

    private String normalizeStatus(String status) {
        return status == null ? "" : status.trim().toUpperCase(Locale.ROOT).replace(' ', '_');
    }

    public record ApprovalStatusUpdate(@NotBlank String status) {}
    public record ComplaintStatusUpdate(@NotBlank String status) {}
    public record CooperativeApproval(
            Long id,
            String organizationName,
            String coordinatorEmail,
            String location,
            String approvalStatus,
            java.time.LocalDateTime createdAt) {}
    
    public record AdminUser(
            Long id,
            String fullName,
            String email,
            String location) {}

    public record AdminUsersResponse(
            int totalUrbanGenerators,
            int totalCooperatives,
            List<AdminUser> urbanGenerators,
            List<AdminUser> cooperatives) {}
}

