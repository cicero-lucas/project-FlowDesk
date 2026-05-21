import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { UserService } from '../../../core/services/user.service';
import { Role, User } from '../../../core/models/models';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatCardModule, MatTableModule, MatButtonModule, MatIconModule,
    MatDialogModule, MatFormFieldModule, MatInputModule, MatSelectModule,
    MatSnackBarModule, MatSlideToggleModule, MatTooltipModule
  ],
  template: `
    <div class="user-list">
      <div class="page-header">
        <div>
          <h2 class="page-title">Usuários</h2>
          <p class="page-subtitle">Gerenciamento de usuários do sistema</p>
        </div>
        <button mat-raised-button class="new-btn" (click)="openForm()">
          <mat-icon>person_add</mat-icon> Novo Usuário
        </button>
      </div>

      <div class="content-grid">
        <mat-card class="table-card">
          <table mat-table [dataSource]="users">
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>Nome</th>
              <td mat-cell *matCellDef="let u">
                <div class="user-cell">
                  <div class="user-avatar">{{ u.name.charAt(0) }}</div>
                  <div>
                    <div class="user-name">{{ u.name }}</div>
                    <div class="user-email">{{ u.email }}</div>
                  </div>
                </div>
              </td>
            </ng-container>

            <ng-container matColumnDef="role">
              <th mat-header-cell *matHeaderCellDef>Perfil</th>
              <td mat-cell *matCellDef="let u">
                <span class="role-badge" [ngClass]="'role-' + u.role.toLowerCase()">{{ u.role }}</span>
              </td>
            </ng-container>

            <ng-container matColumnDef="active">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let u">
                <span class="active-badge" [ngClass]="u.active ? 'active' : 'inactive'">
                  {{ u.active ? 'Ativo' : 'Inativo' }}
                </span>
              </td>
            </ng-container>

            <ng-container matColumnDef="createdAt">
              <th mat-header-cell *matHeaderCellDef>Criado em</th>
              <td mat-cell *matCellDef="let u">{{ u.createdAt | date:'dd/MM/yyyy' }}</td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let u">
                <button mat-icon-button (click)="openForm(u)" matTooltip="Editar">
                  <mat-icon>edit</mat-icon>
                </button>
                <button mat-icon-button (click)="toggleActive(u)"
                        [matTooltip]="u.active ? 'Desativar' : 'Ativar'">
                  <mat-icon>{{ u.active ? 'person_off' : 'person' }}</mat-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>
        </mat-card>

        <mat-card class="form-card" *ngIf="showForm">
          <mat-card-header>
            <mat-card-title>{{ editingUser ? 'Editar Usuário' : 'Novo Usuário' }}</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <form [formGroup]="form" (ngSubmit)="onSubmit()">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Nome</mat-label>
                <input matInput formControlName="name">
                <mat-error>Nome obrigatório</mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>E-mail</mat-label>
                <input matInput formControlName="email" type="email">
                <mat-error>E-mail inválido</mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>{{ editingUser ? 'Nova Senha (opcional)' : 'Senha' }}</mat-label>
                <input matInput formControlName="password" type="password">
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Perfil</mat-label>
                <mat-select formControlName="role">
                  <mat-option value="ADMIN">Admin</mat-option>
                  <mat-option value="ANALISTA">Analista</mat-option>
                  <mat-option value="USUARIO">Usuário</mat-option>
                </mat-select>
              </mat-form-field>

              <div class="form-actions">
                <button mat-stroked-button type="button" (click)="closeForm()">Cancelar</button>
                <button mat-raised-button type="submit" class="save-btn" [disabled]="form.invalid">
                  <mat-icon>save</mat-icon> Salvar
                </button>
              </div>
            </form>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .user-list { max-width: 1200px; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
    .page-title { font-size: 28px; font-weight: 700; color: #1e293b; margin: 0 0 4px; }
    .page-subtitle { color: #64748b; margin: 0; font-size: 14px; }
    .new-btn { background: linear-gradient(135deg, #6366f1, #8b5cf6) !important; color: white !important; border-radius: 8px !important; }

    .content-grid { display: grid; grid-template-columns: 1fr 360px; gap: 16px; }

    .table-card { border-radius: 12px !important; }
    table { width: 100%; }
    th.mat-header-cell { font-weight: 600; color: #64748b; font-size: 12px; text-transform: uppercase; }

    .user-cell { display: flex; align-items: center; gap: 10px; padding: 8px 0; }
    .user-avatar {
      width: 36px; height: 36px; border-radius: 50%;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      display: flex; align-items: center; justify-content: center;
      color: white; font-weight: 700; font-size: 14px; flex-shrink: 0;
    }
    .user-name { font-size: 13px; font-weight: 600; color: #1e293b; }
    .user-email { font-size: 11px; color: #94a3b8; }

    .role-badge { font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 20px; color: white; }
    .role-admin { background: #ef4444; }
    .role-analista { background: #3b82f6; }
    .role-usuario { background: #10b981; }

    .active-badge { font-size: 11px; font-weight: 600; padding: 3px 10px; border-radius: 20px; }
    .active { background: #d1fae5; color: #065f46; }
    .inactive { background: #fee2e2; color: #991b1b; }

    .form-card { border-radius: 12px !important; height: fit-content; }
    mat-card-title { font-size: 16px !important; font-weight: 600 !important; }
    mat-card-content { padding-top: 16px !important; }
    .full-width { width: 100%; margin-bottom: 4px; }

    .form-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 8px; }
    .save-btn { background: linear-gradient(135deg, #6366f1, #8b5cf6) !important; color: white !important; border-radius: 8px !important; display: flex; align-items: center; gap: 6px; }

    @media (max-width: 900px) { .content-grid { grid-template-columns: 1fr; } }
  `]
})
export class UserListComponent implements OnInit {
  users: User[] = [];
  showForm = false;
  editingUser: User | null = null;
  form: FormGroup;
  displayedColumns = ['name', 'role', 'active', 'createdAt', 'actions'];

  constructor(
    private userService: UserService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: [''],
      role: ['USUARIO', Validators.required]
    });
  }

  ngOnInit(): void { this.load(); }

  load(): void {
    this.userService.getAll().subscribe(p => { this.users = p.content; });
  }

  openForm(user?: User): void {
    this.editingUser = user ?? null;
    this.showForm = true;
    if (user) {
      this.form.patchValue({ name: user.name, email: user.email, role: user.role, password: '' });
      this.form.get('password')?.clearValidators();
    } else {
      this.form.reset({ role: 'USUARIO' });
      this.form.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    }
    this.form.get('password')?.updateValueAndValidity();
  }

  closeForm(): void {
    this.showForm = false;
    this.editingUser = null;
    this.form.reset();
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    const data = this.form.value;

    const request$ = this.editingUser
      ? this.userService.update(this.editingUser.id, data)
      : this.userService.create(data);

    request$.subscribe({
      next: () => {
        this.snackBar.open(this.editingUser ? 'Usuário atualizado!' : 'Usuário criado!', 'Fechar', { duration: 3000 });
        this.load();
        this.closeForm();
      },
      error: (err) => {
        const msg = err.error?.detail ?? 'Erro ao salvar usuário';
        this.snackBar.open(msg, 'Fechar', { duration: 4000 });
      }
    });
  }

  toggleActive(user: User): void {
    this.userService.toggleActive(user.id).subscribe({
      next: () => {
        this.snackBar.open(`Usuário ${user.active ? 'desativado' : 'ativado'}!`, 'Fechar', { duration: 2000 });
        this.load();
      }
    });
  }
}
