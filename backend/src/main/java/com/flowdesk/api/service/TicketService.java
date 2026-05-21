package com.flowdesk.api.service;

import com.flowdesk.api.dto.*;
import com.flowdesk.api.exception.BusinessException;
import com.flowdesk.api.exception.ResourceNotFoundException;
import com.flowdesk.api.model.*;
import com.flowdesk.api.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class TicketService {

    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final CommentRepository commentRepository;
    private final TicketHistoryRepository historyRepository;

    @Transactional
    public TicketResponse create(TicketRequest request, User requester) {
        var ticket = Ticket.builder()
                .title(request.title())
                .description(request.description())
                .priority(request.priority())
                .requester(requester)
                .build();

        if (request.assigneeId() != null) {
            ticket.setAssignee(getUser(request.assigneeId()));
        }

        var saved = ticketRepository.save(ticket);
        recordHistory(saved, requester, "status", null, TicketStatus.ABERTO.name());
        log.info("Ticket created: id={}, requester={}", saved.getId(), requester.getEmail());
        return TicketResponse.from(saved);
    }

    public Page<TicketResponse> findAll(TicketStatus status, Priority priority, Pageable pageable) {
        if (status != null && priority != null) {
            return ticketRepository.findByStatusAndPriority(status, priority, pageable).map(TicketResponse::from);
        } else if (status != null) {
            return ticketRepository.findByStatus(status, pageable).map(TicketResponse::from);
        } else if (priority != null) {
            return ticketRepository.findByPriority(priority, pageable).map(TicketResponse::from);
        }
        return ticketRepository.findAll(pageable).map(TicketResponse::from);
    }

    public Page<TicketResponse> findByRequester(Long requesterId, Pageable pageable) {
        return ticketRepository.findByRequesterId(requesterId, pageable).map(TicketResponse::from);
    }

    public TicketResponse findById(Long id) {
        return TicketResponse.from(getTicket(id));
    }

    @Transactional
    public TicketResponse update(Long id, TicketRequest request, User currentUser) {
        var ticket = getTicket(id);

        if (currentUser.getRole() == Role.USUARIO && !ticket.getPriority().equals(request.priority())) {
            throw new BusinessException("Usuários comuns não podem alterar a prioridade");
        }

        if (!ticket.getTitle().equals(request.title())) {
            recordHistory(ticket, currentUser, "title", ticket.getTitle(), request.title());
            ticket.setTitle(request.title());
        }
        if (!ticket.getDescription().equals(request.description())) {
            recordHistory(ticket, currentUser, "description", "...", "...");
            ticket.setDescription(request.description());
        }
        if (!ticket.getPriority().equals(request.priority())) {
            recordHistory(ticket, currentUser, "priority", ticket.getPriority().name(), request.priority().name());
            ticket.setPriority(request.priority());
        }
        if (request.assigneeId() != null) {
            var newAssignee = getUser(request.assigneeId());
            String oldAssignee = ticket.getAssignee() != null ? ticket.getAssignee().getName() : "Nenhum";
            if (!newAssignee.equals(ticket.getAssignee())) {
                recordHistory(ticket, currentUser, "assignee", oldAssignee, newAssignee.getName());
                ticket.setAssignee(newAssignee);
            }
        }

        return TicketResponse.from(ticketRepository.save(ticket));
    }

    @Transactional
    public TicketResponse updateStatus(Long id, TicketStatusRequest request, User currentUser) {
        var ticket = getTicket(id);
        var newStatus = request.status();

        if ((newStatus == TicketStatus.RESOLVIDO || newStatus == TicketStatus.FECHADO)
                && currentUser.getRole() == Role.USUARIO) {
            throw new BusinessException("Apenas analistas podem finalizar chamados");
        }

        recordHistory(ticket, currentUser, "status", ticket.getStatus().name(), newStatus.name());
        ticket.setStatus(newStatus);

        if (newStatus == TicketStatus.FECHADO || newStatus == TicketStatus.RESOLVIDO) {
            ticket.setClosedAt(LocalDateTime.now());
        }

        log.info("Ticket {} status changed to {} by {}", id, newStatus, currentUser.getEmail());
        return TicketResponse.from(ticketRepository.save(ticket));
    }

    @Transactional
    public CommentResponse addComment(Long ticketId, CommentRequest request, User author) {
        var ticket = getTicket(ticketId);
        var comment = Comment.builder()
                .content(request.content())
                .ticket(ticket)
                .author(author)
                .build();
        return CommentResponse.from(commentRepository.save(comment));
    }

    public List<CommentResponse> getComments(Long ticketId) {
        getTicket(ticketId);
        return commentRepository.findByTicketIdOrderByCreatedAtAsc(ticketId)
                .stream().map(CommentResponse::from).toList();
    }

    public List<TicketHistoryResponse> getHistory(Long ticketId) {
        getTicket(ticketId);
        return historyRepository.findByTicketIdOrderByChangedAtDesc(ticketId)
                .stream().map(TicketHistoryResponse::from).toList();
    }

    public DashboardResponse getDashboard() {
        return new DashboardResponse(
                ticketRepository.count(),
                ticketRepository.countByStatus(TicketStatus.ABERTO),
                ticketRepository.countByStatus(TicketStatus.EM_ANALISE),
                ticketRepository.countByStatus(TicketStatus.AGUARDANDO_CLIENTE),
                ticketRepository.countByStatus(TicketStatus.RESOLVIDO),
                ticketRepository.countByStatus(TicketStatus.FECHADO),
                ticketRepository.countByPriority(Priority.CRITICA),
                ticketRepository.countByPriority(Priority.ALTA)
        );
    }

    private void recordHistory(Ticket ticket, User changedBy, String field, String oldValue, String newValue) {
        historyRepository.save(TicketHistory.builder()
                .ticket(ticket)
                .changedBy(changedBy)
                .fieldChanged(field)
                .oldValue(oldValue)
                .newValue(newValue)
                .build());
    }

    private Ticket getTicket(Long id) {
        return ticketRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException("Chamado não encontrado: " + id));
    }

    private User getUser(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado: " + id));
    }
}
