import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Page, User } from '../models/models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly url = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  getAll(page = 0, size = 20): Observable<Page<User>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<Page<User>>(this.url, { params });
  }

  getById(id: number): Observable<User> {
    return this.http.get<User>(`${this.url}/${id}`);
  }

  create(data: Partial<User> & { password: string }): Observable<User> {
    return this.http.post<User>(this.url, data);
  }

  update(id: number, data: Partial<User> & { password?: string }): Observable<User> {
    return this.http.put<User>(`${this.url}/${id}`, data);
  }

  toggleActive(id: number): Observable<void> {
    return this.http.patch<void>(`${this.url}/${id}/toggle-active`, {});
  }
}
