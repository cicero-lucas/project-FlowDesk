import { Component, computed } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet, RouterLink, RouterLinkActive, CommonModule,
    MatSidenavModule, MatToolbarModule, MatListModule, MatIconModule,
    MatButtonModule, MatMenuModule, MatDividerModule, MatChipsModule
  ],
  template: `
    <ng-container *ngIf="isAuthenticated(); else loginView">
      <mat-sidenav-container class="app-container">
        <mat-sidenav #sidenav mode="side" opened class="sidenav">
          <div class="sidenav-header">
            <div class="logo">
              <mat-icon class="logo-icon">support_agent</mat-icon>
              <span class="logo-text">FlowDesk</span>
            </div>
            <div class="user-info" *ngIf="currentUser()">
              <div class="user-avatar">{{ currentUser()!.name.charAt(0).toUpperCase() }}</div>
              <div class="user-details">
                <span class="user-name">{{ currentUser()!.name }}</span>
                <mat-chip class="role-chip" [ngClass]="'role-' + currentUser()!.role.toLowerCase()">
                  {{ currentUser()!.role }}
                </mat-chip>
              </div>
            </div>
          </div>

          <mat-nav-list class="nav-list">
            <a mat-list-item routerLink="/dashboard" routerLinkActive="active-link">
              <mat-icon matListItemIcon>dashboard</mat-icon>
              <span matListItemTitle>Dashboard</span>
            </a>
            <a mat-list-item routerLink="/tickets" routerLinkActive="active-link" [routerLinkActiveOptions]="{exact: true}">
              <mat-icon matListItemIcon>confirmation_number</mat-icon>
              <span matListItemTitle>Chamados</span>
            </a>
            <a mat-list-item routerLink="/tickets/new" routerLinkActive="active-link">
              <mat-icon matListItemIcon>add_circle</mat-icon>
              <span matListItemTitle>Novo Chamado</span>
            </a>
            <ng-container *ngIf="isAdmin()">
              <mat-divider></mat-divider>
              <a mat-list-item routerLink="/users" routerLinkActive="active-link">
                <mat-icon matListItemIcon>manage_accounts</mat-icon>
                <span matListItemTitle>Usuários</span>
              </a>
            </ng-container>
          </mat-nav-list>

          <div class="sidenav-footer">
            <button mat-list-item (click)="logout()" class="logout-btn">
              <mat-icon>logout</mat-icon>
              <span>Sair</span>
            </button>
          </div>
        </mat-sidenav>

        <mat-sidenav-content class="main-content">
          <mat-toolbar class="top-toolbar">
            <button mat-icon-button (click)="sidenav.toggle()">
              <mat-icon>menu</mat-icon>
            </button>
            <span class="toolbar-spacer"></span>
            <button mat-icon-button [matMenuTriggerFor]="userMenu">
              <div class="toolbar-avatar">{{ currentUser()?.name?.charAt(0)?.toUpperCase() }}</div>
            </button>
            <mat-menu #userMenu="matMenu">
              <div class="menu-user-info">
                <strong>{{ currentUser()?.name }}</strong>
                <small>{{ currentUser()?.email }}</small>
              </div>
              <mat-divider></mat-divider>
              <button mat-menu-item (click)="logout()">
                <mat-icon>logout</mat-icon> Sair
              </button>
            </mat-menu>
          </mat-toolbar>
          <div class="content-wrapper">
            <router-outlet></router-outlet>
          </div>
        </mat-sidenav-content>
      </mat-sidenav-container>
    </ng-container>

    <ng-template #loginView>
      <router-outlet></router-outlet>
    </ng-template>
  `,
  styles: [`
    .app-container { height: 100vh; }

    .sidenav {
      width: 260px;
      background: linear-gradient(180deg, #1a1f3a 0%, #0d1117 100%);
      border-right: none;
    }

    .sidenav-header {
      padding: 24px 16px 16px;
      border-bottom: 1px solid rgba(255,255,255,0.08);
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 20px;
    }

    .logo-icon {
      color: #6366f1;
      font-size: 32px;
      width: 32px;
      height: 32px;
    }

    .logo-text {
      font-size: 22px;
      font-weight: 700;
      color: #fff;
      letter-spacing: 0.5px;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .user-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 700;
      font-size: 16px;
      flex-shrink: 0;
    }

    .user-details {
      display: flex;
      flex-direction: column;
      gap: 4px;
      overflow: hidden;
    }

    .user-name {
      color: #e2e8f0;
      font-size: 13px;
      font-weight: 600;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .role-chip {
      font-size: 10px !important;
      height: 18px !important;
      padding: 0 8px !important;
      min-height: unset !important;
    }

    .role-admin { background: #ef4444 !important; color: white !important; }
    .role-analista { background: #3b82f6 !important; color: white !important; }
    .role-usuario { background: #10b981 !important; color: white !important; }

    .nav-list {
      padding: 8px 0;
      flex: 1;
    }

    .nav-list a {
      color: rgba(255,255,255,0.65) !important;
      border-radius: 8px !important;
      margin: 2px 8px !important;
      transition: all 0.2s ease;
    }

    .nav-list a:hover {
      background: rgba(99,102,241,0.15) !important;
      color: #fff !important;
    }

    .nav-list a.active-link {
      background: rgba(99,102,241,0.25) !important;
      color: #6366f1 !important;
      border-left: 3px solid #6366f1;
    }

    .nav-list mat-icon { color: inherit !important; }

    .sidenav-footer {
      padding: 16px;
      border-top: 1px solid rgba(255,255,255,0.08);
    }

    .logout-btn {
      width: 100%;
      color: rgba(255,255,255,0.5) !important;
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;
      background: none;
      border: none;
      font-size: 14px;
    }

    .logout-btn:hover { background: rgba(239,68,68,0.15) !important; color: #ef4444 !important; }

    .main-content { background: #f8fafc; }

    .top-toolbar {
      background: #fff !important;
      border-bottom: 1px solid #e2e8f0;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .toolbar-spacer { flex: 1; }

    .toolbar-avatar {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 700;
      font-size: 14px;
      cursor: pointer;
    }

    .menu-user-info {
      padding: 12px 16px;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .menu-user-info strong { font-size: 14px; }
    .menu-user-info small { color: #64748b; font-size: 12px; }

    .content-wrapper {
      padding: 24px;
      min-height: calc(100vh - 64px);
    }
  `]
})
export class AppComponent {
  currentUser = this.auth.currentUser;
  isAuthenticated = computed(() => !!this.currentUser());
  isAdmin = computed(() => this.currentUser()?.role === 'ADMIN');

  constructor(private auth: AuthService, private router: Router) {}

  logout(): void {
    this.auth.logout();
  }
}
