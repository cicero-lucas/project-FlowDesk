import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TicketService } from '../../../core/services/ticket.service';
import { UserService } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/models';

@Component({
  selector: 'app-ticket-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterLink,
    MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatIconModule, MatSnackBarModule, MatProgressSpinnerModule
  ],
  template: `
    <div class="form-page">
      <div class="page-header">
        <button mat-icon-button routerLink="/tickets">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <div>
          <h2 class="page-title">{{ isEdit ? 'Editar Chamado' : 'Novo Chamado' }}</h2>
          <p class="page-subtitle">{{ isEdit ? 'Atualize as informações do chamado' : 'Preencha os dados para abrir um chamado' }}</p>
        </div>
      </div>

      <mat-card class="form-card">
        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <div class="form-grid">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Título</mat-label>
                <input matInput formControlName="title" placeholder="Descreva brevemente o problema">
                <mat-error *ngIf="form.get('title')?.hasError('required')">Título obrigatório</mat-error>
                <mat-error *ngIf="form.get('title')?.hasError('minlength')">Mínimo 5 caracteres</mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Descrição</mat-label>
                <textarea matInput formControlName="description" rows="5"
                          placeholder="Descreva detalhadamente o problema..."></textarea>
                <mat-error *ngIf="form.get('description')?.hasError('required')">Descrição obrigatória</mat-error>
              </mat-form-field>

              <div class="two-cols">
                <mat-form-field appearance="outline">
                  <mat-label>Prioridade</mat-label>
                  <mat-select formControlName="priority">
                    <mat-option *ngFor="let p of priorities" [value]="p.value">
                      <span class="priority-option" [ngClass]="'p-' + p.value.toLowerCase()">{{ p.label }}</span>
                    </mat-option>
                  </mat-select>
                  <mat-error>Prioridade obrigatória</mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline" *ngIf="canAssign">
                  <mat-label>Responsável</mat-label>
                  <mat-select formControlName="assigneeId">
                    <mat-option [value]="null">Não atribuído</mat-option>
                    <mat-option *ngFor="let u of analysts" [value]="u.id">{{ u.name }}</mat-option>
                  </mat-select>
                </mat-form-field>
              </div>
            </div>

            <div class="form-actions">
              <button mat-stroked-button type="button" routerLink="/tickets">Cancelar</button>
              <button mat-raised-button type="submit" class="submit-btn" [disabled]="loading || form.invalid">
                <mat-spinner diameter="18" *ngIf="loading"></mat-spinner>
                <mat-icon *ngIf="!loading">{{ isEdit ? 'save' : 'send' }}</mat-icon>
                <span>{{ isEdit ? 'Salvar' : 'Abrir Chamado' }}</span>
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .form-page { max-width: 800px; }
    .page-header { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; }
    .page-title { font-size: 24px; font-weight: 700; color: #1e293b; margin: 0 0 4px; }
    .page-subtitle { color: #64748b; margin: 0; font-size: 14px; }

    .form-card { border-radius: 16px !important; }
    mat-card-content { padding: 24px !important; }

    .form-grid { display: flex; flex-direction: column; gap: 8px; }
    .full-width { width: 100%; }
    .two-cols { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

    .priority-option { font-weight: 600; }
    .p-critica { color: #ef4444; }
    .p-alta { color: #f97316; }
    .p-media { color: #f59e0b; }
    .p-baixa { color: #10b981; }

    .form-actions {
      display: flex; justify-content: flex-end; gap: 12px;
      margin-top: 24px; padding-top: 24px; border-top: 1px solid #f1f5f9;
    }

    .submit-btn {
      background: linear-gradient(135deg, #6366f1, #8b5cf6) !important;
      color: white !important; border-radius: 8px !important;
      display: flex; align-items: center; gap: 8px; padding: 0 24px;
    }

    @media (max-width: 600px) { .two-cols { grid-template-columns: 1fr; } }
  `]
})
export class TicketFormComponent implements OnInit {
  form: FormGroup;
  loading = false;
  isEdit = false;
  ticketId?: number;
  analysts: User[] = [];

  priorities = [
    { value: 'BAIXA', label: 'Baixa' },
    { value: 'MEDIA', label: 'Média' },
    { value: 'ALTA', label: 'Alta' },
    { value: 'CRITICA', label: 'Crítica' }
  ];

  get canAssign(): boolean {
    return this.auth.hasRole('ADMIN', 'ANALISTA');
  }

  constructor(
    private fb: FormBuilder,
    private ticketService: TicketService,
    private userService: UserService,
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(200)]],
      description: ['', Validators.required],
      priority: ['MEDIA', Validators.required],
      assigneeId: [null]
    });
  }

  ngOnInit(): void {
    this.ticketId = this.route.snapshot.params['id'] ? +this.route.snapshot.params['id'] : undefined;
    this.isEdit = !!this.ticketId && this.router.url.includes('/edit');

    if (this.canAssign) {
      this.userService.getAll(0, 100).subscribe(p => {
        this.analysts = p.content.filter(u => u.role === 'ANALISTA' || u.role === 'ADMIN');
      });
    }

    if (this.isEdit && this.ticketId) {
      this.ticketService.getById(this.ticketId).subscribe(t => {
        this.form.patchValue({
          title: t.title,
          description: t.description,
          priority: t.priority,
          assigneeId: t.assignee?.id ?? null
        });
        if (this.auth.hasRole('USUARIO')) {
          this.form.get('priority')?.disable();
        }
      });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    const data = this.form.getRawValue();

    const request$ = this.isEdit && this.ticketId
      ? this.ticketService.update(this.ticketId, data)
      : this.ticketService.create(data);

    request$.subscribe({
      next: (t) => {
        this.snackBar.open(
          this.isEdit ? 'Chamado atualizado!' : 'Chamado aberto com sucesso!',
          'Fechar', { duration: 3000 }
        );
        this.router.navigate(['/tickets', t.id]);
      },
      error: () => {
        this.loading = false;
        this.snackBar.open('Erro ao salvar chamado', 'Fechar', { duration: 3000 });
      }
    });
  }
}
