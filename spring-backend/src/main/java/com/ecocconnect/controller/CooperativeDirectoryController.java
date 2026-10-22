package com.ecoconnect.controller;

import com.ecoconnect.dto.CooperativeSummary;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import spring_backend.entity.UserAccount;
import spring_backend.entity.UserRole;
import spring_backend.repository.UserAccountRepository;

import java.util.List;

@RestController
@RequestMapping("/api/cooperatives")
public class CooperativeDirectoryController {

    private final UserAccountRepository userAccountRepository;

    public CooperativeDirectoryController(UserAccountRepository userAccountRepository) {
        this.userAccountRepository = userAccountRepository;
    }

    @GetMapping
    public List<CooperativeSummary> getCooperatives(HttpSession session) {
        if (!UserRole.URBAN_WASTE_GENERATOR.name().equals(session.getAttribute("ecoconnectRole"))) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Sign in as an urban waste generator to find cooperatives.");
        }

        return userAccountRepository.findAllByRoleOrderByCreatedAtDesc(UserRole.COOPERATIVE_COORDINATOR)
                .stream()
                .filter(account -> account.getOrganizationName() != null
                        && !account.getOrganizationName().isBlank())
                .map(CooperativeDirectoryController::toSummary)
                .toList();
    }

    private static CooperativeSummary toSummary(UserAccount account) {
        return new CooperativeSummary(
                account.getId(),
                account.getOrganizationName(),
                account.getLocation()
        );
    }
}
