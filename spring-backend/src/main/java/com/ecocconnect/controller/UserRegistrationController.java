package spring_backend.controller;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import spring_backend.dto.UserRegistrationRequest;
import spring_backend.dto.UserLoginRequest;
import spring_backend.dto.UserLoginResponse;
import spring_backend.dto.UserRegistrationResponse;
import spring_backend.service.UserRegistrationService;

@RestController
@RequestMapping("/api/users")
public class UserRegistrationController {

    private final UserRegistrationService userRegistrationService;

    public UserRegistrationController(UserRegistrationService userRegistrationService) {
        this.userRegistrationService = userRegistrationService;
    }

    @PostMapping("/register")
    public ResponseEntity<UserRegistrationResponse> register(
            @Valid @RequestBody UserRegistrationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(userRegistrationService.register(request));
    }
    @PostMapping("/login")
    public UserLoginResponse login(@Valid @RequestBody UserLoginRequest request,
                                   jakarta.servlet.http.HttpSession session) {
        UserLoginResponse user = userRegistrationService.login(request);
        session.setAttribute("ecoconnectUserId", user.id());
        session.setAttribute("ecoconnectEmail", user.email());
        session.setAttribute("ecoconnectRole", user.role().name());
        session.setAttribute("ecoconnectFullName", user.fullName());
        return user;
    }

    @PostMapping("/logout")
    public java.util.Map<String, String> logout(jakarta.servlet.http.HttpSession session) {
        session.invalidate();
        return java.util.Map.of("message", "Logged out successfully.");
    }

}
