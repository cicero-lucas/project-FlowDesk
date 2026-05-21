import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TicketService } from '../../../core/services/ticket.service';
import { AuthService } from '../../../core/services/auth.service';
import { Comment, Ticket, TicketHistory, TicketStatus } from '../../../core/models/models';

@Component({
  selector: 'app-ticket-detail',
  standalone: true,
  imports: [
    CommonModule, RouterLink, FormsModule,
    MatCardModule, MatButtonModule, MatIconModule, MatSelectModule,
    MatFormFieldModule, MatInputModule, MatDividerModule, MatSnackBarModule,
    MatTabsModule, MatTooltipModule
  ],
  template: `
    <div class="detail-page" *ngIf="ticket">
      <div class="page-header">
        <button mat-icon-button routerLink="/tickets">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <div class="header-info">
          <div class="header-top">
            <span class="ticket-id">#{{ ticket.id }}</span>
            <span class="status-badge" [ngClass]="'status-' + ticket.status.toLowerCase()">
              {{ statusLabel(ticket.status) }}
            </span>
            <span class="priority-badge" [ngClass]="'priority-' + ticket.priority.toLowerCase()">
              {{ ticket.priority }}
            </span>
          </div>
          <h2 class="page-title">{{ ticket.title }}</h2>
        </div>
        <a mat-stroked-button [routerLink]="['/tickets', ticket.id, 'edit']" class="edit-btn">
          <mat-icon>edit</mat-icon> Editar
        </a>
      </div>

      <div class="detail-grid">
        <div class="main-col">
          <mat-card class="detail-card">
            <mat-card-header>
              <mat-card-title>Descrição</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <p class="description">{{ ticket.description }}</p>
            </mat-card-content>
          </mat-card>

          <mat-card class="detail-card" *ngIf="canChangeStatus">
            <mat-card-header>
              <mat-card-title>Atualizar Status</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="status-update">
                <mat-form-field appearance="outline">
                  <mat-label>Novo Status</mat-label>
                  <mat-select [(ngModel)]="selectedStatus">
                    <mat-option *ngFor="let s of availableStatuses" [value]="s.value">{{ s.label }}</mat-option>
                  </mat-select>
                </mat-form-field>
                <button mat-raised-button class="update-btn" (click)="updateStatus()" [disabled]="!selectedStatus">
                  <mat-icon>update</mat-icon> Atualizar
                </button>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="detail-card tabs-card">
            <mat-tab-group>
              <mat-tab>
                <ng-template mat-tab-label>
                  <mat-icon>chat</mat-icon>
                  Comentários ({{ comments.length }})
                </ng-template>
                <div class="tab-content">
                  <div class="comments-list">
                    <div class="comment" *ngFor="let c of comments">
                      <div class="comment-avatar">{{ c.author.name.charAt(0) }}</div>
                      <div class="comment-body">
                        <div class="comment-header">
                          <strong>{{ c.author.name }}</strong>
                          <span class="role-tag" [ngClass]="'role-' + c.author.role.toLowerCase()">{{ c.author.role }}</span>
                          <span class="comment-date">{{ c.createdAt | date:'dd/MM/yyyy HH:mm' }}</span>
                        </div>
                        <p class="comment-text">{{ c.content }}</p>
                      </div>
                    </div>
                    <div class="empty-comments" *ngIf="comments.length === 0">
                      <mat-icon>chat_bubble_outline</mat-icon>
                      <p>Nenhum comentário ainda</p>
                    </div>
                  </div>
                  <div class="add-comment">
                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Adicionar comentário</mat-label>
                      <textarea matInput [(ngModel)]="newComment" rows="3"
                                placeholder="Escreva seu comentário..."></textarea>
                    </mat-form-field>
                    <button mat-raised-button class="comment-btn" (click)="addComment()" [disabled]="!newComment.trim()">
                      <mat-icon>send</mat-icon> Comentar
                    </button>
                  </div>
                </div>
              </mat-tab>

              <mat-tab>
                <ng-template mat-tab-label>
                  <mat-icon>history</mat-icon>
                  Histórico ({{ history.length }})
                </ng-template>
                <div class="tab-content">
                  <div class="history-list">
                    <div class="history-item" *ngFor="let h of history">
                      <div class="history-icon">
                        <mat-icon>{{ historyIcon(h.fieldChanged) }}</mat-icon>
                      </div>
                      <div class="history-body">
                        <div class="history-header">
                          <strong>{{ h.changedBy.name }}</strong>
                          <span class="history-date">{{ h.changedAt | date:'dd/MM/yyyy HH:mm' }}</span>
                        </div>
                        <p class="history-text">
                          Alterou <strong>{{ fieldLabel(h.fieldChanged) }}</strong>
                          <ng-container *ngIf="h.oldValue"> de <span class="old-val">{{ h.oldValue }}</span></ng-container>
                          <ng-container *ngIf="h.newValue"> para <span class="new-val">{{ h.newValue }}</span></ng-container>
                        </p>
                      </div>
                    </div>
                    <div class="empty-comments" *ngIf="history.length === 0">
                      <mat-icon>history</mat-icon>
                      <p>Nenhum histórico</p>
                    </div>
                  </div>
                </div>
              </mat-tab>
            </mat-tab-group>
          </mat-card>
        </div>

        <div class="side-col">
          <mat-card class="detail-card info-card">
            <mat-card-header><mat-card-title>Informações</mat-card-title></mat-card-header>
            <mat-card-content>
              <div class="info-item">
                <span class="info-label">Solicitante</span>
                <div class="user-info">
                  <div class="user-avatar">{{ ticket.requester.name.charAt(0) }}</div>
                  <div>
                    <div class="user-name">{{ ticket.requester.name }}</div>
                    <div class="user-email">{{ ticket.requester.email }}</div>
                  </div>
                </div>
              </div>
              <mat-divider></mat-divider>
              <div class="info-item">
                <span class="info-label">Responsável</span>
                <div class="user-info" *ngIf="ticket.assignee; else noAssignee">
                  <div class="user-avatar assignee">{{ ticket.assignee.name.charAt(0) }}</div>
                  <div>
                    <div class="user-name">{{ ticket.assignee.name }}</div>
                    <div class="user-email">{{ ticket.assignee.email }}</div>
                  </div>
                </div>
                <ng-template #noAssignee>
                  <span class="no-value">Não atribuído</span>
                </ng-template>
              </div>
              <mat-divider></mat-divider>
              <div class="info-item">
                <span class="info-label">Criado em</span>
                <span class="info-value">{{ ticket.createdAt | date:'dd/MM/yyyy HH:mm' }}</span>
              </div>
              <div class="info-item" *ngIf="ticket.updatedAt">
                <span class="info-label">Atualizado em</span>
                <span class="info-value">{{ ticket.updatedAt | date:'dd/MM/yyyy HH:mm' }}</span>
              </div>
              <div class="info-item" *ngIf="ticket.closedAt">
                <span class="info-label">Fechado em</span>
                <span class="info-value">{{ ticket.closedAt | date:'dd/MM/yyyy HH:mm' }}</span>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .detail-page { max-width: 1200px; }
    .page-header { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 24px; }
    .header-info { flex: 1; }
    .header-top { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
    .ticket-id { font-size: 14px; color: #94a3b8; font-weight: 600; }
    .page-title { font-size: 22px; font-weight: 700; color: #1e293b; margin: 0; }
    .edit-btn { border-radius: 8px !important; }

    .status-badge { font-size: 11px; font-weight: 600; padding: 3px 10px; border-radius: 20px; }
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

    .detail-grid { display: grid; grid-template-columns: 1fr 320px; gap: 16px; }
    .main-col { display: flex; flex-direction: column; gap: 16px; }
    .side-col { display: flex; flex-direction: column; gap: 16px; }

    .detail-card { border-radius: 12px !important; }
    mat-card-title { font-size: 15px !important; font-weight: 600 !important; }
    mat-card-content { padding-top: 12px !important; }

    .description { color: #374151; line-height: 1.7; white-space: pre-wrap; margin: 0; }

    .status-update { display: flex; gap: 12px; align-items: flex-start; }
    .status-update mat-form-field { flex: 1; }
    .update-btn {
      background: linear-gradient(135deg, #6366f1, #8b5cf6) !important;
      color: white !important; border-radius: 8px !important; margin-top: 4px;
      display: flex; align-items: center; gap: 6px;
    }

    .tabs-card mat-tab-group { margin: -16px; }
    .tab-content { padding: 16px; }

    .comments-list { display: flex; flex-direction: column; gap: 16px; margin-bottom: 20px; }
    .comment { display: flex; gap: 12px; }
    .comment-avatar {
      width: 36px; height: 36px; border-radius: 50%;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      display: flex; align-items: center; justify-content: center;
      color: white; font-weight: 700; font-size: 14px; flex-shrink: 0;
    }
    .comment-body { flex: 1; background: #f8fafc; border-radius: 12px; padding: 12px; }
    .comment-header { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
    .comment-header strong { font-size: 13px; color: #1e293b; }
    .comment-date { font-size: 11px; color: #94a3b8; margin-left: auto; }
    .comment-text { margin: 0; font-size: 13px; color: #374151; line-height: 1.6; }

    .role-tag { font-size: 10px; font-weight: 700; padding: 1px 6px; border-radius: 4px; color: white; }
    .role-admin { background: #ef4444; }
    .role-analista { background: #3b82f6; }
    .role-usuario { background: #10b981; }

    .empty-comments { display: flex; flex-direction: column; align-items: center; padding: 32px; color: #94a3b8; }
    .empty-comments mat-icon { font-size: 48px; width: 48px; height: 48px; margin-bottom: 8px; }
    .empty-comments p { margin: 0; }

    .add-comment { border-top: 1px solid #f1f5f9; padding-top: 16px; }
    .full-width { width: 100%; }
    .comment-btn {
      background: linear-gradient(135deg, #6366f1, #8b5cf6) !important;
      color: white !important; border-radius: 8px !important;
      display: flex; align-items: center; gap: 6px; margin-top: 8px;
    }

    .history-list { display: flex; flex-direction: column; gap: 12px; }
    .history-item { display: flex; gap: 12px; align-items: flex-start; }
    .history-icon {
      width: 32px; height: 32px; border-radius: 50%; background: #f1f5f9;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    .history-icon mat-icon { font-size: 16px; width: 16px; height: 16px; color: #6366f1; }
    .history-body { flex: 1; }
    .history-header { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
    .history-header strong { font-size: 13px; }
    .history-date { font-size: 11px; color: #94a3b8; margin-left: auto; }
    .history-text { margin: 0; font-size: 13px; color: #64748b; }
    .old-val { color: #ef4444; font-weight: 500; }
    .new-val { color: #10b981; font-weight: 500; }

    .info-card mat-card-content { padding: 0 16px 16px !important; }
    .info-item { padding: 12px 0; }
    .info-label { font-size: 11px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 8px; }
    .info-value { font-size: 13px; color: #374151; }
    .no-value { font-size: 13px; color: #94a3b8; font-style: italic; }

    .user-info { display: flex; align-items: center; gap: 10px; }
    .user-avatar {
      width: 36px; height: 36px; border-radius: 50%;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      display: flex; align-items: center; justify-content: center;
      color: white; font-weight: 700; font-size: 14px; flex-shrink: 0;
    }
    .user-avatar.assignee { background: linear-gradient(135deg, #10b981, #059669); }
    .user-name { font-size: 13px; font-weight: 600; color: #1e293b; }
    .user-email { font-size: 11px; color: #94a3b8; }

    @media (max-width: 900px) { .detail-grid { grid-template-columns: 1fr; } }
  `]
})
export class TicketDetailComponent implements OnInit {
  ticket: Ticket | null = null;
  comments: Comment[] = [];
  history: TicketHistory[] = [];
  newComment = '';
  selectedStatus: TicketStatus | null = null;

  availableStatuses: { value: TicketStatus; label: string }[] = [
    { value: 'ABERTO', label: 'Aberto' },
    { value: 'EM_ANALISE', label: 'Em Análise' },
    { value: 'AGUARDANDO_CLIENTE', label: 'Aguardando Cliente' },
    { value: 'RESOLVIDO', label: 'Resolvido' },
    { value: 'FECHADO', label: 'Fechado' }
  ];

  get canChangeStatus(): boolean {
    return this.auth.hasRole('ADMIN', 'ANALISTA');
  }

  constructor(
    private route: ActivatedRoute,
    private ticketService: TicketService,
    public auth: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    const id = +this.route.snapshot.params['id'];
    this.ticketService.getById(id).subscribe(t => { this.ticket = t; });
    this.ticketService.getComments(id).subscribe(c => { this.comments = c; });
    this.ticketService.getHistory(id).subscribe(h => { this.history = h; });
  }

  updateStatus(): void {
    if (!this.ticket || !this.selectedStatus) return;
    this.ticketService.updateStatus(this.ticket.id, this.selectedStatus).subscribe({
      next: t => {
        this.ticket = t;
        this.ticketService.getHistory(t.id).subscribe(h => { this.history = h; });
        this.snackBar.open('Status atualizado!', 'Fechar', { duration: 3000 });
        this.selectedStatus = null;
      },
      error: (err) => {
        const msg = err.error?.detail ?? 'Erro ao atualizar status';
        this.snackBar.open(msg, 'Fechar', { duration: 4000 });
      }
    });
  }

  addComment(): void {
    if (!this.ticket || !this.newComment.trim()) return;
    this.ticketService.addComment(this.ticket.id, this.newComment).subscribe({
      next: c => {
        this.comments.push(c);
        this.newComment = '';
        this.snackBar.open('Comentário adicionado!', 'Fechar', { duration: 2000 });
      }
    });
  }

  statusLabel(status: string): string {
    const map: Record<string, string> = {
      ABERTO: 'Aberto', EM_ANALISE: 'Em Análise',
      AGUARDANDO_CLIENTE: 'Aguard. Cliente', RESOLVIDO: 'Resolvido', FECHADO: 'Fechado'
    };
    return map[status] ?? status;
  }

  fieldLabel(field: string): string {
    const map: Record<string, string> = {
      status: 'status', priority: 'prioridade',
      title: 'título', description: 'descrição', assignee: 'responsável'
    };
    return map[field] ?? field;
  }

  historyIcon(field: string): string {
    const map: Record<string, string> = {
      status: 'swap_horiz', priority: 'flag',
      title: 'title', description: 'description', assignee: 'person'
    };
    return map[field] ?? 'edit';
  }
}
