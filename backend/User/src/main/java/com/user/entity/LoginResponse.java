package com.user.entity;

public class LoginResponse {
    private String accessToken;
    private String email;
    private String role;
    private Long userId;

    public LoginResponse(String accessToken, String email, String role,Long userId) {
        this.accessToken = accessToken;
        this.email = email;
        this.role = role;
        this.userId = userId;
    }
    public String getAccessToken() { return accessToken; }
    public String getEmail() { return email; }
    public String getRole() { return role; }
    public Long getUserId() {return userId;}
}
