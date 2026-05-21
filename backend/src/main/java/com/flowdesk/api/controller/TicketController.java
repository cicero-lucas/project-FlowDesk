package com.flowdesk.api.controller;

import com.flowdesk.api.dto.*;
import com.flowdesk.api.model.Priority;
import com.flowdesk.api.model.TicketStatus;
import com.flowdesk.api.model.User;
import com.flowdesk.api.service.TicketService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/tickets")
@RequiredArgsConstructor
@Tag(name = "Chamados")
public class TicketController {

    private final TicketService ticketService;

    @PostMapping
    @Operation(summary = "Criar chamado")
    public ResponseEntity<TicketResponse> create(
            @Valid @RequestBody TicketRequest request,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ticketService.create(request, currentUser));
    }

    @GetMapping
    @Operation(summary = "Listar chamados com filtros")
    public ResponseEntity<Page<TicketResponse>> findAll(
            @RequestParam(required = false) TicketStatus status,
            @RequestParam(required = false) Priority priority,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(ticketService.findAll(status, priority, pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar chamado por ID")
    public ResponseEntity<TicketResponse> findById(@PathVariable Long id) {
        return ResponseEntity.ok(ticketService.findById(id));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualizar chamado")
    public ResponseEntity<TicketResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody TicketRequest request,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(ticketService.update(id, request, currentUser));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Atualizar status do chamado")
    public ResponseEntity<TicketResponse> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody TicketStatusRequest request,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(ticketService.updateStatus(id, request, currentUser));
    }

    @PostMapping("/{id}/comments")
    @Operation(summary = "Adicionar comentário")
    public ResponseEntity<CommentResponse> addComment(
            @PathVariable Long id,
            @Valid @RequestBody CommentRequest request,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ticketService.addComment(id, request, currentUser));
    }

    @GetMapping("/{id}/comments")
    @Operation(summary = "Listar comentários do chamado")
    public ResponseEntity<List<CommentResponse>> getComments(@PathVariable Long id) {
        return ResponseEntity.ok(ticketService.getComments(id));
    }

    @GetMapping("/{id}/history")
    @Operation(summary = "Histórico de alterações")
    public ResponseEntity<List<TicketHistoryResponse>> getHistory(@PathVariable Long id) {
        return ResponseEntity.ok(ticketService.getHistory(id));
    }

    @GetMapping("/dashboard")
    @Operation(summary = "Métricas do dashboard")
    public ResponseEntity<DashboardResponse> getDashboard() {
        return ResponseEntity.ok(ticketService.getDashboard());
    }
}
