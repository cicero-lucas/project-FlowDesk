package com.flowdesk.api.repository;

import com.flowdesk.api.model.TicketHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TicketHistoryRepository extends JpaRepository<TicketHistory, Long> {
    List<TicketHistory> findByTicketIdOrderByChangedAtDesc(Long ticketId);
}
