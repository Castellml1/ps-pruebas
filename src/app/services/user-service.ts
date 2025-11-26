// empleado.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/users';
import { environment } from '../environments';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private readonly apiUrl = `${environment.apiUrl}/keycloak/user`;

  constructor(private http: HttpClient) {}

  getUsuarios(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/list`);
  }

  getUsuariosPorUsername(username: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/search/${username}`);
  }

  crearUsuario(usuario: User): Observable<any> {
    return this.http.post<User>(`${this.apiUrl}/create`, usuario);
  }

  actualizarUsuario(username: string, usuario: User): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/update/${username}`, usuario);
  }

  asignarRoles(username: string, roles: string[]): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/assign-roles/${username}`, roles);
  }
}
