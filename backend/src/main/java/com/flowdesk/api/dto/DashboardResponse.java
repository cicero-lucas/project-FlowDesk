package com.flowdesk.api.dto;

public record DashboardResponse(
        long totalTickets,
        long openTickets,
        long inAnalysisTickets,
        long waitingClientTickets,
        long resolvedTickets,
        long closedTickets,
        long criticalTickets,
        long highTickets
) {}
