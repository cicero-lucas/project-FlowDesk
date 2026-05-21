package com.flowdesk.api.dto;

import com.flowdesk.api.model.Priority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record TicketRequest(
        @NotBlank @Size(min = 5, max = 200) String title,
        @NotBlank String description,
        @NotNull Priority priority,
        Long assigneeId
) {}
