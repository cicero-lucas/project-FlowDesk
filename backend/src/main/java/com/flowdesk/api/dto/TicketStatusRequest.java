package com.flowdesk.api.dto;

import com.flowdesk.api.model.TicketStatus;
import jakarta.validation.constraints.NotNull;

public record TicketStatusRequest(@NotNull TicketStatus status) {}
