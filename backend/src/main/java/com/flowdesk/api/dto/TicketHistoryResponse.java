package com.flowdesk.api.dto;

import com.flowdesk.api.model.TicketHistory;

import java.time.LocalDateTime;

public record TicketHistoryResponse(
        Long id,
        String fieldChanged,
        String oldValue,
        String newValue,
        UserResponse changedBy,
        LocalDateTime changedAt
) {
    public static TicketHistoryResponse from(TicketHistory h) {
        return new TicketHistoryResponse(h.getId(), h.getFieldChanged(),
                h.getOldValue(), h.getNewValue(),
                UserResponse.from(h.getChangedBy()), h.getChangedAt());
    }
}
