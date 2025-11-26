import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TipoDispositivo } from '../models/dispositivo';
import { environment } from '../environments';
import { CatEntidadFederativa, CatMunicipio, Giro } from '../models/catalogos';

@Injectable({
  providedIn: 'root',
})
export class CatalogosService {
  private readonly apiUrl = `${environment.apiUrl}/catalogos`;

  constructor(private http: HttpClient) {}

  // GIRO
  getGiros(): Observable<Giro[]> {
    return this.http.get<Giro[]>(`${this.apiUrl}/giro`);
  }

  // ENTIDAD FEDERATIVA
  getEntidades(): Observable<CatEntidadFederativa[]> {
    return this.http.get<CatEntidadFederativa[]>(
      `${this.apiUrl}/entidadFederativa`
    );
  }

  // MUNICIPIO
  getMunicipios(): Observable<CatMunicipio[]> {
    return this.http.get<CatMunicipio[]>(`${this.apiUrl}/municipio`);
  }

  getMunicipiosPorEntidad(
    claveEntidadFederativa: string
  ): Observable<CatMunicipio[]> {
    return this.http.get<CatMunicipio[]>(
      `${this.apiUrl}/municipio/${claveEntidadFederativa}`
    );
  }

  // DISPOSITIVOS
  getTiposDispositivo(): Observable<TipoDispositivo[]> {
    return this.http.get<TipoDispositivo[]>(`${this.apiUrl}/tipodispositivo`);
  }
}
