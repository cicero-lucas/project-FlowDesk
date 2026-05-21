import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule, MatSnackBarModule
  ],
  template: `
    <div class="login-container">
      <div class="login-left">
        <div class="brand">
          <mat-icon class="brand-icon">support_agent</mat-icon>
          <h1>FlowDesk</h1>
          <p>Sistema de Gerenciamento de Chamados</p>
        </div>
        <div class="features">
          <div class="feature" *ngFor="let f of features">
            <mat-icon>{{ f.icon }}</mat-icon>
            <span>{{ f.text }}</span>
          </div>
        </div>
      </div>

      <div class="login-right">
        <mat-card class="login-card">
          <mat-card-header>
            <mat-card-title>Bem-vindo de volta</mat-card-title>
            <mat-card-subtitle>Faça login para continuar</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <form [formGroup]="form" (ngSubmit)="onSubmit()">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>E-mail</mat-label>
                <input matInput formControlName="email" type="email" placeholder="seu@email.com">
                <mat-icon matPrefix>email</mat-icon>
                <mat-error *ngIf="form.get('email')?.hasError('required')">E-mail obrigatório</mat-error>
                <mat-error *ngIf="form.get('email')?.hasError('email')">E-mail inválido</mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Senha</mat-label>
                <input matInput formControlName="password" [type]="hidePassword ? 'password' : 'text'">
                <mat-icon matPrefix>lock</mat-icon>
                <button mat-icon-button matSuffix type="button" (click)="hidePassword = !hidePassword">
                  <mat-icon>{{ hidePassword ? 'visibility_off' : 'visibility' }}</mat-icon>
                </button>
                <mat-error *ngIf="form.get('password')?.hasError('required')">Senha obrigatória</mat-error>
              </mat-form-field>

              <button mat-raised-button type="submit" class="submit-btn" [disabled]="loading">
                <mat-spinner diameter="20" *ngIf="loading"></mat-spinner>
                <span *ngIf="!loading">Entrar</span>
              </button>
            </form>

            <div class="demo-credentials">
              <p class="demo-title">Credenciais de demonstração:</p>
              <div class="credential" *ngFor="let c of demoCredentials" (click)="fillCredentials(c)">
                <span class="cred-role" [ngClass]="'role-' + c.role.toLowerCase()">{{ c.role }}</span>
                <span class="cred-email">{{ c.email }}</span>
                <span class="cred-pass">{{ c.password }}</span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .login-container { min-height: 100vh; display: flex; }

    .login-left {
      flex: 1;
      background: linear-gradient(135deg, #1a1f3a 0%, #0d1117 60%, #1e1b4b 100%);
      display: flex; flex-direction: column; justify-content: center;
      align-items: center; padding: 48px; color: white;
    }

    .brand { text-align: center; margin-bottom: 48px; }
    .brand-icon { font-size: 72px; width: 72px; height: 72px; color: #6366f1; margin-bottom: 16px; }
    .brand h1 {
      font-size: 48px; font-weight: 800; margin: 0 0 8px;
      background: linear-gradient(135deg, #6366f1, #a78bfa);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    }
    .brand p { font-size: 16px; color: rgba(255,255,255,0.6); margin: 0; }

    .features { display: flex; flex-direction: column; gap: 16px; width: 100%; max-width: 320px; }
    .feature {
      display: flex; align-items: center; gap: 12px; padding: 12px 16px;
      background: rgba(255,255,255,0.05); border-radius: 12px;
      border: 1px solid rgba(255,255,255,0.08);
    }
    .feature mat-icon { color: #6366f1; }
    .feature span { color: rgba(255,255,255,0.8); font-size: 14px; }

    .login-right {
      width: 480px; display: flex; align-items: center;
      justify-content: center; padding: 48px; background: #f8fafc;
    }

    .login-card {
      width: 100%; border-radius: 16px !important;
      box-shadow: 0 20px 60px rgba(0,0,0,0.1) !important; padding: 8px;
    }

    mat-card-title { font-size: 24px !important; font-weight: 700 !important; }
    mat-card-subtitle { font-size: 14px !important; margin-top: 4px !important; }
    mat-card-content { padding-top: 24px !important; }

    .full-width { width: 100%; margin-bottom: 8px; }

    .submit-btn {
      width: 100%; height: 48px; font-size: 16px; font-weight: 600;
      border-radius: 8px !important;
      background: linear-gradient(135deg, #6366f1, #8b5cf6) !important;
      color: white !important; margin-top: 8px;
      display: flex; align-items: center; justify-content: center; gap: 8px;
    }

    .demo-credentials {
      margin-top: 24px; padding: 16px; background: #f1f5f9; border-radius: 12px;
    }
    .demo-title {
      font-size: 12px; font-weight: 600; color: #64748b;
      margin: 0 0 12px; text-transform: uppercase; letter-spacing: 0.5px;
    }
    .credential {
      display: flex; align-items: center; gap: 8px; padding: 8px;
      border-radius: 8px; cursor: pointer; transition: background 0.2s; margin-bottom: 4px;
    }
    .credential:hover { background: #e2e8f0; }
    .cred-role {
      font-size: 10px; font-weight: 700; padding: 2px 8px;
      border-radius: 4px; color: white; min-width: 70px; text-align: center;
    }
    .role-admin { background: #ef4444; }
    .role-analista { background: #3b82f6; }
    .role-usuario { background: #10b981; }
    .cred-email { font-size: 12px; color: #374151; flex: 1; }
    .cred-pass { font-size: 12px; color: #6b7280; font-family: monospace; }

    @media (max-width: 768px) {
      .login-left { display: none; }
      .login-right { width: 100%; padding: 24px; }
    }
  `]
})
export class LoginComponent {
  form: FormGroup;
  loading = false;
  hidePassword = true;

  features = [
    { icon: 'confirmation_number', text: 'Gestão completa de chamados' },
    { icon: 'timeline', text: 'Workflow de status automatizado' },
    { icon: 'analytics', text: 'Dashboard com métricas em tempo real' },
    { icon: 'security', text: 'Controle de acesso por perfil' }
  ];

  demoCredentials = [
    { role: 'ADMIN', email: 'admin@flowdesk.com', password: 'admin123' },
    { role: 'ANALISTA', email: 'analista@flowdesk.com', password: 'analista123' },
    { role: 'USUARIO', email: 'usuario@flowdesk.com', password: 'usuario123' }
  ];

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  fillCredentials(cred: { email: string; password: string }): void {
    this.form.patchValue({ email: cred.email, password: cred.password });
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    const { email, password } = this.form.value;
    this.auth.login(email, password).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: () => {
        this.loading = false;
        this.snackBar.open('Credenciais inválidas', 'Fechar', { duration: 3000 });
      }
    });
  }
}
