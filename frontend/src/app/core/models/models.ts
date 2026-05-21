export type Role = 'ADMIN' | 'ANALISTA' | 'USUARIO';
export type TicketStatus = 'ABERTO' | 'EM_ANALISE' | 'AGUARDANDO_CLIENTE' | 'RESOLVIDO' | 'FECHADO';
export type Priority = 'BAIXA' | 'MEDIA' | 'ALTA' | 'CRITICA';

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  active: boolean;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Ticket {
  id: number;
  title: string;
  description: string;
  status: TicketStatus;
  priority: Priority;
  requester: User;
  assignee?: User;
  createdAt: string;
  updatedAt?: string;
  closedAt?: string;
  commentsCount: number;
}

export interface Comment {
  id: number;
  content: string;
  author: User;
  createdAt: string;
}

export interface TicketHistory {
  id: number;
  fieldChanged: string;
  oldValue: string;
  newValue: string;
  changedBy: User;
  changedAt: string;
}

export interface Dashboard {
  totalTickets: number;
  openTickets: number;
  inAnalysisTickets: number;
  waitingClientTickets: number;
  resolvedTickets: number;
  closedTickets: number;
  criticalTickets: number;
  highTickets: number;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface TicketFilter {
  status?: TicketStatus;
  priority?: Priority;
  page?: number;
  size?: number;
}
