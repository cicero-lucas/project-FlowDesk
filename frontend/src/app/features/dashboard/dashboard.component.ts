import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDividerModule } from '@angular/material/divider';
import { TicketService } from '../../core/services/ticket.service';
import { AuthService } from '../../core/services/auth.service';
import { Dashboard, Ticket } from '../../core/models/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, RouterLink,
    MatCardModule, MatIconModule, MatButtonModule,
    MatProgressBarModule, MatDividerModule
  ],
  template: `
    <div class="dashboard">
      <div class="page-header">
        <div>
          <h2 class="page-title">Dashboard</h2>
          <p class="page-subtitle">Visão geral dos chamados</p>
        </div>
        <a mat-raised-button routerLink="/tickets/new" class="new-btn">
          <mat-icon>add</mat-icon> Novo Chamado
        </a>
      </div>

      <div class="metrics-grid" *ngIf="dashboard">
        <mat-card class="metric-card total">
          <mat-icon>confirmation_number</mat-icon>
          <div class="metric-info">
            <span class="metric-value">{{ dashboard.totalTickets }}</span>
            <span class="metric-label">Total de Chamados</span>
          </div>
        </mat-card>
        <mat-card class="metric-card open">
          <mat-icon>radio_button_unchecked</mat-icon>
          <div class="metric-info">
            <span class="metric-value">{{ dashboard.openTickets }}</span>
            <span class="metric-label">Abertos</span>
          </div>
        </mat-card>
        <mat-card class="metric-card analysis">
          <mat-icon>manage_search</mat-icon>
          <div class="metric-info">
            <span class="metric-value">{{ dashboard.inAnalysisTickets }}</span>
            <span class="metric-label">Em Análise</span>
          </div>
        </mat-card>
        <mat-card class="metric-card waiting">
          <mat-icon>hourglass_empty</mat-icon>
          <div class="metric-info">
            <span class="metric-value">{{ dashboard.waitingClientTickets }}</span>
            <span class="metric-label">Aguardando Cliente</span>
          </div>
        </mat-card>
        <mat-card class="metric-card resolved">
          <mat-icon>check_circle</mat-icon>
          <div class="metric-info">
            <span class="metric-value">{{ dashboard.resolvedTickets }}</span>
            <span class="metric-label">Resolvidos</span>
          </div>
        </mat-card>
        <mat-card class="metric-card closed">
          <mat-icon>lock</mat-icon>
          <div class="metric-info">
            <span class="metric-value">{{ dashboard.closedTickets }}</span>
            <span class="metric-label">Fechados</span>
          </div>
        </mat-card>
        <mat-card class="metric-card critical">
          <mat-icon>priority_high</mat-icon>
          <div class="metric-info">
            <span class="metric-value">{{ dashboard.criticalTickets }}</span>
            <span class="metric-label">Prioridade Crítica</span>
          </div>
        </mat-card>
        <mat-card class="metric-card high">
          <mat-icon>arrow_upward</mat-icon>
          <div class="metric-info">
            <span class="metric-value">{{ dashboard.highTickets }}</span>
            <span class="metric-label">Prioridade Alta</span>
          </div>
        </mat-card>
      </div>

      <div class="charts-row" *ngIf="dashboard">
        <mat-card class="chart-card">
          <mat-card-header>
            <mat-card-title>Distribuição por Status</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="bar-chart">
              <div class="bar-item" *ngFor="let item of statusBars">
                <div class="bar-label">
                  <span class="status-dot" [ngClass]="item.cls"></span>
                  {{ item.label }}
                </div>
                <div class="bar-track">
                  <div class="bar-fill" [ngClass]="item.cls"
                       [style.width.%]="getPercent(item.value)"></div>
                </div>
                <span class="bar-value">{{ item.value }}</span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="chart-card">
          <mat-card-header>
            <mat-card-title>Resumo de Prioridades</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="priority-summary">
              <div class="priority-item" *ngFor="let p of priorityItems">
                <div class="priority-header">
                  <span class="priority-badge" [ngClass]="p.cls">{{ p.label }}</span>
                  <span class="priority-count">{{ p.value }}</span>
                </div>
                <mat-progress-bar [value]="getPercent(p.value)" [color]="p.color"></mat-progress-bar>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <mat-card class="recent-card" *ngIf="recentTickets.length">
        <mat-card-header>
          <mat-card-title>Chamados Recentes</mat-card-title>
          <a mat-button routerLink="/tickets" class="see-all">Ver todos</a>
        </mat-card-header>
        <mat-card-content>
          <div class="ticket-row" *ngFor="let t of recentTickets" [routerLink]="['/tickets', t.id]">
            <div class="ticket-id">#{{ t.id }}</div>
            <div class="ticket-info">
              <span class="ticket-title">{{ t.title }}</span>
              <span class="ticket-meta">{{ t.requester.name }} · {{ t.createdAt | date:'dd/MM/yyyy HH:mm' }}</span>
            </div>
            <span class="status-badge" [ngClass]="'status-' + t.status.toLowerCase()">
              {{ statusLabel(t.status) }}
            </span>
            <span class="priority-badge-sm" [ngClass]="'priority-' + t.priority.toLowerCase()">
              {{ t.priority }}
            </span>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .dashboard { max-width: 1400px; }

    .page-header {
      display: flex; justify-content: space-between; align-items: flex-start;
      margin-bottom: 28px;
    }
    .page-title { font-size: 28px; font-weight: 700; color: #1e293b; margin: 0 0 4px; }
    .page-subtitle { color: #64748b; margin: 0; font-size: 14px; }
    .new-btn {
      background: linear-gradient(135deg, #6366f1, #8b5cf6) !important;
      color: white !important; border-radius: 8px !important;
    }

    .metrics-grid {
      display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 16px; margin-bottom: 24px;
    }

    .metric-card {
      display: flex; align-items: center; gap: 16px;
      padding: 20px !important; border-radius: 12px !important;
      border-left: 4px solid transparent; cursor: default;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .metric-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.1) !important; }

    .metric-card mat-icon { font-size: 36px; width: 36px; height: 36px; opacity: 0.85; }
    .metric-info { display: flex; flex-direction: column; }
    .metric-value { font-size: 32px; font-weight: 800; line-height: 1; }
    .metric-label { font-size: 12px; color: #64748b; margin-top: 4px; }

    .metric-card.total { border-color: #6366f1; }
    .metric-card.total mat-icon, .metric-card.total .metric-value { color: #6366f1; }
    .metric-card.open { border-color: #3b82f6; }
    .metric-card.open mat-icon, .metric-card.open .metric-value { color: #3b82f6; }
    .metric-card.analysis { border-color: #f59e0b; }
    .metric-card.analysis mat-icon, .metric-card.analysis .metric-value { color: #f59e0b; }
    .metric-card.waiting { border-color: #8b5cf6; }
    .metric-card.waiting mat-icon, .metric-card.waiting .metric-value { color: #8b5cf6; }
    .metric-card.resolved { border-color: #10b981; }
    .metric-card.resolved mat-icon, .metric-card.resolved .metric-value { color: #10b981; }
    .metric-card.closed { border-color: #64748b; }
    .metric-card.closed mat-icon, .metric-card.closed .metric-value { color: #64748b; }
    .metric-card.critical { border-color: #ef4444; }
    .metric-card.critical mat-icon, .metric-card.critical .metric-value { color: #ef4444; }
    .metric-card.high { border-color: #f97316; }
    .metric-card.high mat-icon, .metric-card.high .metric-value { color: #f97316; }

    .charts-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }

    .chart-card { border-radius: 12px !important; }
    mat-card-title { font-size: 16px !important; font-weight: 600 !important; }

    .bar-chart { display: flex; flex-direction: column; gap: 12px; padding-top: 8px; }
    .bar-item { display: flex; align-items: center; gap: 12px; }
    .bar-label { display: flex; align-items: center; gap: 6px; width: 160px; font-size: 13px; color: #374151; }
    .status-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
    .bar-track { flex: 1; height: 8px; background: #f1f5f9; border-radius: 4px; overflow: hidden; }
    .bar-fill { height: 100%; border-radius: 4px; transition: width 0.6s ease; }
    .bar-value { font-size: 13px; font-weight: 600; color: #374151; width: 24px; text-align: right; }

    .aberto .bar-fill, .aberto.status-dot { background: #3b82f6; }
    .em_analise .bar-fill, .em_analise.status-dot { background: #f59e0b; }
    .aguardando_cliente .bar-fill, .aguardando_cliente.status-dot { background: #8b5cf6; }
    .resolvido .bar-fill, .resolvido.status-dot { background: #10b981; }
    .fechado .bar-fill, .fechado.status-dot { background: #64748b; }

    .priority-summary { display: flex; flex-direction: column; gap: 16px; padding-top: 8px; }
    .priority-item { display: flex; flex-direction: column; gap: 6px; }
    .priority-header { display: flex; justify-content: space-between; align-items: center; }
    .priority-badge {
      font-size: 11px; font-weight: 700; padding: 2px 10px;
      border-radius: 4px; color: white;
    }
    .priority-count { font-size: 18px; font-weight: 700; color: #1e293b; }
    .critica { background: #ef4444; }
    .alta { background: #f97316; }
    .media { background: #f59e0b; }
    .baixa { background: #10b981; }

    .recent-card { border-radius: 12px !important; }
    mat-card-header { display: flex; justify-content: space-between; align-items: center; }
    .see-all { color: #6366f1 !important; }

    .ticket-row {
      display: flex; align-items: center; gap: 12px; padding: 12px 0;
      border-bottom: 1px solid #f1f5f9; cursor: pointer; transition: background 0.2s;
      border-radius: 8px; padding: 10px 8px;
    }
    .ticket-row:hover { background: #f8fafc; }
    .ticket-id { font-size: 12px; color: #94a3b8; font-weight: 600; width: 36px; }
    .ticket-info { flex: 1; display: flex; flex-direction: column; gap: 2px; }
    .ticket-title { font-size: 14px; font-weight: 500; color: #1e293b; }
    .ticket-meta { font-size: 12px; color: #94a3b8; }

    .status-badge {
      font-size: 11px; font-weight: 600; padding: 3px 10px;
      border-radius: 20px; white-space: nowrap;
    }
    .status-aberto { background: #dbeafe; color: #1d4ed8; }
    .status-em_analise { background: #fef3c7; color: #92400e; }
    .status-aguardando_cliente { background: #ede9fe; color: #5b21b6; }
    .status-resolvido { background: #d1fae5; color: #065f46; }
    .status-fechado { background: #f1f5f9; color: #475569; }

    .priority-badge-sm {
      font-size: 10px; font-weight: 700; padding: 2px 8px;
      border-radius: 4px; color: white;
    }
    .priority-critica { background: #ef4444; }
    .priority-alta { background: #f97316; }
    .priority-media { background: #f59e0b; }
    .priority-baixa { background: #10b981; }

    @media (max-width: 768px) {
      .charts-row { grid-template-columns: 1fr; }
      .metrics-grid { grid-template-columns: repeat(2, 1fr); }
    }
  `]
})
export class DashboardComponent implements OnInit {
  dashboard: Dashboard | null = null;
  recentTickets: Ticket[] = [];

  statusBars: { label: string; value: number; cls: string }[] = [];
  priorityItems: { label: string; value: number; cls: string; color: 'primary' | 'accent' | 'warn' }[] = [];

  constructor(
    private ticketService: TicketService,
    public auth: AuthService
  ) {}

  ngOnInit(): void {
    this.ticketService.getDashboard().subscribe(d => {
      this.dashboard = d;
      this.statusBars = [
        { label: 'Aberto', value: d.openTickets, cls: 'aberto' },
        { label: 'Em Análise', value: d.inAnalysisTickets, cls: 'em_analise' },
        { label: 'Aguard. Cliente', value: d.waitingClientTickets, cls: 'aguardando_cliente' },
        { label: 'Resolvido', value: d.resolvedTickets, cls: 'resolvido' },
        { label: 'Fechado', value: d.closedTickets, cls: 'fechado' }
      ];
      this.priorityItems = [
        { label: 'CRÍTICA', value: d.criticalTickets, cls: 'critica', color: 'warn' },
        { label: 'ALTA', value: d.highTickets, cls: 'alta', color: 'warn' }
      ];
    });

    this.ticketService.getAll({ size: 5 }).subscribe(p => {
      this.recentTickets = p.content;
    });
  }

  getPercent(value: number): number {
    if (!this.dashboard || this.dashboard.totalTickets === 0) return 0;
    return Math.round((value / this.dashboard.totalTickets) * 100);
  }

  statusLabel(status: string): string {
    const map: Record<string, string> = {
      ABERTO: 'Aberto', EM_ANALISE: 'Em Análise',
      AGUARDANDO_CLIENTE: 'Aguard. Cliente', RESOLVIDO: 'Resolvido', FECHADO: 'Fechado'
    };
    return map[status] ?? status;
  }
}
