// dispositivo.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Dispositivo } from '../models/dispositivo';
import { environment } from '../environments';

@Injectable({ providedIn: 'root' })
export class DispositivoService {
  private readonly apiUrl = `${environment.apiUrl}/dispositivos`;

  constructor(private http: HttpClient) {}

  getDispositivos(): Observable<Dispositivo[]> {
    return this.http.get<Dispositivo[]>(this.apiUrl);
  }

  getDispositivoPorId(id: number): Observable<Dispositivo> {
    return this.http.get<Dispositivo>(`${this.apiUrl}/${id}`);
  }

  crearDispositivo(dispositivo: Dispositivo): Observable<Dispositivo> {
    return this.http.post<Dispositivo>(this.apiUrl, dispositivo);
  }

  actualizarDispositivo(id: number, dispositivo: Dispositivo): Observable<Dispositivo> {
    return this.http.put<Dispositivo>(`${this.apiUrl}/${id}`, dispositivo);
  }

}
