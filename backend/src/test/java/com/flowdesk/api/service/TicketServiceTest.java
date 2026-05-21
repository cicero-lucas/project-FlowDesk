package com.flowdesk.api.service;

import com.flowdesk.api.dto.TicketRequest;
import com.flowdesk.api.dto.TicketStatusRequest;
import com.flowdesk.api.exception.BusinessException;
import com.flowdesk.api.model.*;
import com.flowdesk.api.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TicketServiceTest {

    @Mock TicketRepository ticketRepository;
    @Mock UserRepository userRepository;
    @Mock CommentRepository commentRepository;
    @Mock TicketHistoryRepository historyRepository;

    @InjectMocks TicketService ticketService;

    private User analista;
    private User usuario;
    private Ticket ticket;

    @BeforeEach
    void setUp() {
        analista = User.builder().id(1L).name("Analista").email("analista@test.com").role(Role.ANALISTA).build();
        usuario = User.builder().id(2L).name("Usuario").email("usuario@test.com").role(Role.USUARIO).build();
        ticket = Ticket.builder().id(1L).title("Teste").description("Desc").status(TicketStatus.ABERTO)
                .priority(Priority.MEDIA).requester(usuario).build();
    }

    @Test
    void shouldCreateTicket() {
        var request = new TicketRequest("Novo Chamado", "Descrição", Priority.ALTA, null);
        when(ticketRepository.save(any())).thenReturn(ticket);

        var result = ticketService.create(request, usuario);

        assertThat(result).isNotNull();
        verify(ticketRepository).save(any());
        verify(historyRepository).save(any());
    }

    @Test
    void shouldThrowWhenUserChangesStatus_toResolvido() {
        when(ticketRepository.findByIdWithDetails(1L)).thenReturn(Optional.of(ticket));
        var request = new TicketStatusRequest(TicketStatus.RESOLVIDO);

        assertThatThrownBy(() -> ticketService.updateStatus(1L, request, usuario))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("analistas");
    }

    @Test
    void shouldAllowAnalistaToResolveTicket() {
        when(ticketRepository.findByIdWithDetails(1L)).thenReturn(Optional.of(ticket));
        when(ticketRepository.save(any())).thenReturn(ticket);
        var request = new TicketStatusRequest(TicketStatus.RESOLVIDO);

        assertThatCode(() -> ticketService.updateStatus(1L, request, analista)).doesNotThrowAnyException();
    }

    @Test
    void shouldThrowWhenUserChangesPriority() {
        when(ticketRepository.findByIdWithDetails(1L)).thenReturn(Optional.of(ticket));
        var request = new TicketRequest("Teste", "Desc", Priority.CRITICA, null);

        assertThatThrownBy(() -> ticketService.update(1L, request, usuario))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("prioridade");
    }
}
