package com.flowdesk.api.dto;

import com.flowdesk.api.model.Role;
import com.flowdesk.api.model.User;

import java.time.LocalDateTime;

public record UserResponse(Long id, String name, String email, Role role, boolean active, LocalDateTime createdAt) {

    public static UserResponse from(User user) {
        return new UserResponse(user.getId(), user.getName(), user.getEmail(),
                user.getRole(), user.isActive(), user.getCreatedAt());
    }
}
