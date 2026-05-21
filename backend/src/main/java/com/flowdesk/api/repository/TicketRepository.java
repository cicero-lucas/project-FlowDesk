package com.flowdesk.api.repository;

import com.flowdesk.api.model.Priority;
import com.flowdesk.api.model.Ticket;
import com.flowdesk.api.model.TicketStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface TicketRepository extends JpaRepository<Ticket, Long> {

    Page<Ticket> findByStatus(TicketStatus status, Pageable pageable);

    Page<Ticket> findByPriority(Priority priority, Pageable pageable);

    Page<Ticket> findByStatusAndPriority(TicketStatus status, Priority priority, Pageable pageable);

    Page<Ticket> findByRequesterId(Long requesterId, Pageable pageable);

    long countByStatus(TicketStatus status);

    long countByPriority(Priority priority);

    @Query("SELECT t FROM Ticket t LEFT JOIN FETCH t.requester LEFT JOIN FETCH t.assignee WHERE t.id = :id")
    java.util.Optional<Ticket> findByIdWithDetails(Long id);
}
