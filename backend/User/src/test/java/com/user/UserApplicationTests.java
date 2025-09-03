package com.user;

import com.user.entity.RegisterRequest;
import com.user.entity.LoginRequest;
import com.user.entity.User;
import com.user.service.AuthService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class UserApplicationTests {

    @Autowired
    private AuthService authService;

    // Context loads as before
    @Test
    void contextLoads() {
    }

    @Test
    void registerUser_AndGetUserByEmail_IntegrationTest() {
        RegisterRequest registerRequest = new RegisterRequest();
        registerRequest.setName("IntegrationTest");
        registerRequest.setEmail("integration@test.com");
        registerRequest.setPhone("9876543210");
        registerRequest.setPassword("password");
        // Exception if already present
        try {
            authService.registerUser(registerRequest);
        } catch (Exception ex) {
            // Ignore if already registered in repeated test runs
        }
        User user = authService.getUserByEmail("integration@test.com");
        assertEquals("IntegrationTest", user.getName());
        assertEquals("integration@test.com", user.getEmail());
    }
}
