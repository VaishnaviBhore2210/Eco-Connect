
package com.ecoconnect;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.persistence.autoconfigure.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication(scanBasePackages = {"com.ecoconnect", "spring_backend"})
@EntityScan(basePackages = {"com.ecoconnect", "spring_backend"})
@EnableJpaRepositories(basePackages = {"com.ecoconnect", "spring_backend"})
public class SpringBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(SpringBackendApplication.class, args);
    }
}
