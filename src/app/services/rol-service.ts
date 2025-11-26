import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments';
import { Rol } from '../models/roles';

@Injectable({
  providedIn: 'root',
})
export class RolService {
  private readonly apiUrl = `${environment.apiUrl}/keycloak/role`;

  constructor(private http: HttpClient) {}

  getRoles(): Observable<Rol[]> {
    return this.http.get<Rol[]>(`${this.apiUrl}/list`);
  }

  crearRol(rol: Rol): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/create`, rol);
  }  
}