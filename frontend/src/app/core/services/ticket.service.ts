import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Comment, Dashboard, Page, Ticket, TicketFilter, TicketHistory } from '../models/models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class TicketService {
  private readonly url = `${environment.apiUrl}/tickets`;

  constructor(private http: HttpClient) {}

  getAll(filter: TicketFilter = {}): Observable<Page<Ticket>> {
    let params = new HttpParams()
      .set('page', filter.page ?? 0)
      .set('size', filter.size ?? 10)
      .set('sort', 'createdAt,desc');
    if (filter.status) params = params.set('status', filter.status);
    if (filter.priority) params = params.set('priority', filter.priority);
    return this.http.get<Page<Ticket>>(this.url, { params });
  }

  getById(id: number): Observable<Ticket> {
    return this.http.get<Ticket>(`${this.url}/${id}`);
  }

  create(data: Partial<Ticket>): Observable<Ticket> {
    return this.http.post<Ticket>(this.url, data);
  }

  update(id: number, data: Partial<Ticket>): Observable<Ticket> {
    return this.http.put<Ticket>(`${this.url}/${id}`, data);
  }

  updateStatus(id: number, status: string): Observable<Ticket> {
    return this.http.patch<Ticket>(`${this.url}/${id}/status`, { status });
  }

  getComments(id: number): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${this.url}/${id}/comments`);
  }

  addComment(id: number, content: string): Observable<Comment> {
    return this.http.post<Comment>(`${this.url}/${id}/comments`, { content });
  }

  getHistory(id: number): Observable<TicketHistory[]> {
    return this.http.get<TicketHistory[]>(`${this.url}/${id}/history`);
  }

  getDashboard(): Observable<Dashboard> {
    return this.http.get<Dashboard>(`${this.url}/dashboard`);
  }
}
