package com.flowdesk.api.dto;

import com.flowdesk.api.model.Priority;
import com.flowdesk.api.model.Ticket;
import com.flowdesk.api.model.TicketStatus;

import java.time.LocalDateTime;

public record TicketResponse(
        Long id,
        String title,
        String description,
        TicketStatus status,
        Priority priority,
        UserResponse requester,
        UserResponse assignee,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        LocalDateTime closedAt,
        int commentsCount
) {
    public static TicketResponse from(Ticket ticket) {
        return new TicketResponse(
                ticket.getId(),
                ticket.getTitle(),
                ticket.getDescription(),
                ticket.getStatus(),
                ticket.getPriority(),
                UserResponse.from(ticket.getRequester()),
                ticket.getAssignee() != null ? UserResponse.from(ticket.getAssignee()) : null,
                ticket.getCreatedAt(),
                ticket.getUpdatedAt(),
                ticket.getClosedAt(),
                ticket.getComments().size()
        );
    }
}
