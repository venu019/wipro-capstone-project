package com.user.controller;

import com.user.entity.LoginRequest;
import com.user.entity.LoginResponse;
import com.user.entity.RegisterRequest;
import com.user.entity.User;
import com.user.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        authService.registerUser(request);
        return ResponseEntity.ok("User registered successfully");
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        String token = authService.loginUser(request);
        User user = authService.getUserByEmail(request.getEmail());

        return ResponseEntity.ok(new LoginResponse(token, user.getEmail(), user.getRole(), user.getId()));
    }
}
