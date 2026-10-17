package spring_backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import spring_backend.entity.UserAccount;

public interface UserAccountRepository extends JpaRepository<UserAccount, Long> {
    boolean existsByEmailIgnoreCase(String email);
    java.util.Optional<UserAccount> findByEmailIgnoreCase(String email);
}
