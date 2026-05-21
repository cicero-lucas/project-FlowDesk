package com.flowdesk.api.dto;

import jakarta.validation.constraints.NotBlank;

public record CommentRequest(@NotBlank String content) {}
