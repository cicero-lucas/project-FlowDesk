import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TicketService } from '../../../core/services/ticket.service';
import { Priority, Ticket, TicketFilter, TicketStatus } from '../../../core/models/models';

@Component({
  selector: 'app-ticket-list',
  standalone: true,
  imports: [
    CommonModule, RouterLink, FormsModule,
    MatCardModule, MatTableModule, MatPaginatorModule, MatSelectModule,
    MatFormFieldModule, MatButtonModule, MatIconModule, MatChipsModule,
    MatTooltipModule, MatProgressSpinnerModule
  ],
  template: `
    <div class="ticket-list">
      <div class="page-header">
        <div>
          <h2 class="page-title">Chamados</h2>
          <p class="page-subtitle">{{ totalElements }} chamados encontrados</p>
        </div>
        <a mat-raised-button routerLink="/tickets/new" class="new-btn">
          <mat-icon>add</mat-icon> Novo Chamado
        </a>
      </div>

      <mat-card class="filter-card">
        <div class="filters">
          <mat-form-field appearance="outline" class="filter-field">
            <mat-label>Status</mat-label>
            <mat-select [(ngModel)]="filter.status" (ngModelChange)="applyFilter()">
              <mat-option [value]="undefined">Todos</mat-option>
              <mat-option *ngFor="let s of statuses" [value]="s.value">{{ s.label }}</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" class="filter-field">
            <mat-label>Prioridade</mat-label>
            <mat-select [(ngModel)]="filter.priority" (ngModelChange)="applyFilter()">
              <mat-option [value]="undefined">Todas</mat-option>
              <mat-option *ngFor="let p of priorities" [value]="p.value">{{ p.label }}</mat-option>
            </mat-select>
          </mat-form-field>

          <button mat-stroked-button (click)="clearFilters()" *ngIf="filter.status || filter.priority">
            <mat-icon>clear</mat-icon> Limpar
          </button>
        </div>
      </mat-card>

      <mat-card class="table-card">
        <div class="loading-overlay" *ngIf="loading">
          <mat-spinner diameter="40"></mat-spinner>
        </div>

        <table mat-table [dataSource]="tickets" class="tickets-table">
          <ng-container matColumnDef="id">
            <th mat-header-cell *matHeaderCellDef>#</th>
            <td mat-cell *matCellDef="let t">
              <span class="ticket-id">#{{ t.id }}</span>
            </td>
          </ng-container>

          <ng-container matColumnDef="title">
            <th mat-header-cell *matHeaderCellDef>Título</th>
            <td mat-cell *matCellDef="let t">
              <div class="title-cell">
                <span class="title-text">{{ t.title }}</span>
                <span class="comments-badge" *ngIf="t.commentsCount > 0">
                  <mat-icon>chat_bubble</mat-icon>{{ t.commentsCount }}
                </span>
              </div>
            </td>
          </ng-container>

          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>Status</th>
            <td mat-cell *matCellDef="let t">
              <span class="status-badge" [ngClass]="'status-' + t.status.toLowerCase()">
                {{ statusLabel(t.status) }}
              </span>
            </td>
          </ng-container>

          <ng-container matColumnDef="priority">
            <th mat-header-cell *matHeaderCellDef>Prioridade</th>
            <td mat-cell *matCellDef="let t">
              <span class="priority-badge" [ngClass]="'priority-' + t.priority.toLowerCase()">
                {{ t.priority }}
              </span>
            </td>
          </ng-container>

          <ng-container matColumnDef="requester">
            <th mat-header-cell *matHeaderCellDef>Solicitante</th>
            <td mat-cell *matCellDef="let t">
              <div class="user-cell">
                <div class="user-avatar-sm">{{ t.requester.name.charAt(0) }}</div>
                {{ t.requester.name }}
              </div>
            </td>
          </ng-container>

          <ng-container matColumnDef="assignee">
            <th mat-header-cell *matHeaderCellDef>Responsável</th>
            <td mat-cell *matCellDef="let t">
              <div class="user-cell" *ngIf="t.assignee; else noAssignee">
                <div class="user-avatar-sm assignee">{{ t.assignee.name.charAt(0) }}</div>
                {{ t.assignee.name }}
              </div>
              <ng-template #noAssignee>
                <span class="no-assignee">Não atribuído</span>
              </ng-template>
            </td>
          </ng-container>

          <ng-container matColumnDef="createdAt">
            <th mat-header-cell *matHeaderCellDef>Criado em</th>
            <td mat-cell *matCellDef="let t">
              <span class="date-text">{{ t.createdAt | date:'dd/MM/yy HH:mm' }}</span>
            </td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef></th>
            <td mat-cell *matCellDef="let t">
              <a mat-icon-button [routerLink]="['/tickets', t.id]" matTooltip="Ver detalhes">
                <mat-icon>visibility</mat-icon>
              </a>
              <a mat-icon-button [routerLink]="['/tickets', t.id, 'edit']" matTooltip="Editar">
                <mat-icon>edit</mat-icon>
              </a>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="table-row"></tr>
        </table>

        <div class="empty-state" *ngIf="!loading && tickets.length === 0">
          <mat-icon>inbox</mat-icon>
          <p>Nenhum chamado encontrado</p>
          <a mat-raised-button routerLink="/tickets/new" class="new-btn">Criar primeiro chamado</a>
        </div>

        <mat-paginator
          [length]="totalElements"
          [pageSize]="filter.size ?? 10"
          [pageSizeOptions]="[10, 25, 50]"
          (page)="onPageChange($event)"
          showFirstLastButtons>
        </mat-paginator>
      </mat-card>
    </div>
  `,
  styles: [`
    .ticket-list { max-width: 1400px; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
    .page-title { font-size: 28px; font-weight: 700; color: #1e293b; margin: 0 0 4px; }
    .page-subtitle { color: #64748b; margin: 0; font-size: 14px; }
    .new-btn { background: linear-gradient(135deg, #6366f1, #8b5cf6) !important; color: white !important; border-radius: 8px !important; }

    .filter-card { border-radius: 12px !important; margin-bottom: 16px; padding: 16px !important; }
    .filters { display: flex; gap: 16px; align-items: center; flex-wrap: wrap; }
    .filter-field { min-width: 180px; }

    .table-card { border-radius: 12px !important; position: relative; overflow: hidden; }
    .loading-overlay {
      position: absolute; inset: 0; background: rgba(255,255,255,0.8);
      display: flex; align-items: center; justify-content: center; z-index: 10;
    }

    .tickets-table { width: 100%; }
    th.mat-header-cell { font-weight: 600; color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
    .table-row { cursor: pointer; transition: background 0.15s; }
    .table-row:hover { background: #f8fafc; }

    .ticket-id { font-size: 12px; color: #94a3b8; font-weight: 600; }

    .title-cell { display: flex; align-items: center; gap: 8px; }
    .title-text { font-weight: 500; color: #1e293b; }
    .comments-badge { display: flex; align-items: center; gap: 2px; font-size: 11px; color: #94a3b8; }
    .comments-badge mat-icon { font-size: 14px; width: 14px; height: 14px; }

    .status-badge { font-size: 11px; font-weight: 600; padding: 3px 10px; border-radius: 20px; white-space: nowrap; }
    .status-aberto { background: #dbeafe; color: #1d4ed8; }
    .status-em_analise { background: #fef3c7; color: #92400e; }
    .status-aguardando_cliente { background: #ede9fe; color: #5b21b6; }
    .status-resolvido { background: #d1fae5; color: #065f46; }
    .status-fechado { background: #f1f5f9; color: #475569; }

    .priority-badge { font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 4px; color: white; }
    .priority-critica { background: #ef4444; }
    .priority-alta { background: #f97316; }
    .priority-media { background: #f59e0b; }
    .priority-baixa { background: #10b981; }

    .user-cell { display: flex; align-items: center; gap: 8px; font-size: 13px; }
    .user-avatar-sm {
      width: 28px; height: 28px; border-radius: 50%;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      display: flex; align-items: center; justify-content: center;
      color: white; font-size: 11px; font-weight: 700; flex-shrink: 0;
    }
    .user-avatar-sm.assignee { background: linear-gradient(135deg, #10b981, #059669); }
    .no-assignee { font-size: 12px; color: #94a3b8; font-style: italic; }
    .date-text { font-size: 12px; color: #64748b; }

    .empty-state {
      display: flex; flex-direction: column; align-items: center;
      padding: 48px; color: #94a3b8;
    }
    .empty-state mat-icon { font-size: 64px; width: 64px; height: 64px; margin-bottom: 16px; }
    .empty-state p { font-size: 16px; margin: 0 0 16px; }
  `]
})
export class TicketListComponent implements OnInit {
  tickets: Ticket[] = [];
  totalElements = 0;
  loading = false;
  filter: TicketFilter = { page: 0, size: 10 };

  displayedColumns = ['id', 'title', 'status', 'priority', 'requester', 'assignee', 'createdAt', 'actions'];

  statuses: { value: TicketStatus; label: string }[] = [
    { value: 'ABERTO', label: 'Aberto' },
    { value: 'EM_ANALISE', label: 'Em Análise' },
    { value: 'AGUARDANDO_CLIENTE', label: 'Aguardando Cliente' },
    { value: 'RESOLVIDO', label: 'Resolvido' },
    { value: 'FECHADO', label: 'Fechado' }
  ];

  priorities: { value: Priority; label: string }[] = [
    { value: 'BAIXA', label: 'Baixa' },
    { value: 'MEDIA', label: 'Média' },
    { value: 'ALTA', label: 'Alta' },
    { value: 'CRITICA', label: 'Crítica' }
  ];

  constructor(private ticketService: TicketService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.ticketService.getAll(this.filter).subscribe({
      next: page => {
        this.tickets = page.content;
        this.totalElements = page.totalElements;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  applyFilter(): void {
    this.filter.page = 0;
    this.load();
  }

  clearFilters(): void {
    this.filter = { page: 0, size: this.filter.size };
    this.load();
  }

  onPageChange(event: PageEvent): void {
    this.filter.page = event.pageIndex;
    this.filter.size = event.pageSize;
    this.load();
  }

  statusLabel(status: string): string {
    const map: Record<string, string> = {
      ABERTO: 'Aberto', EM_ANALISE: 'Em Análise',
      AGUARDANDO_CLIENTE: 'Aguard. Cliente', RESOLVIDO: 'Resolvido', FECHADO: 'Fechado'
    };
    return map[status] ?? status;
  }
}
