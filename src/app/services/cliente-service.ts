import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../environments';
import {
  Cliente,
  ClienteContacto,
  ClienteDomicilio,
  ClienteRepresentanteLegal,
  ClienteListado,
  ClienteSucursal,
} from '../models/cliente';

@Injectable({
  providedIn: 'root',
})
export class ClienteService {
  private apiUrl = `${environment.apiUrl}/clientes`;

  constructor(private http: HttpClient) {}

  // CLIENTE
  getClientes(): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(this.apiUrl);
  }

  getClientesList(): Observable<ClienteListado[]> {
    return this.http.get<ClienteListado[]>(`${this.apiUrl}/list`);
  }

  getClienteById(id: number): Observable<Cliente> {
    return this.http.get<Cliente>(`${this.apiUrl}/${id}`);
  }

  crearCliente(cliente: Cliente): Observable<Cliente> {
    return this.http.post<Cliente>(this.apiUrl, cliente);
  }

  updateCliente(id: number, cliente: Cliente): Observable<Cliente> {
    return this.http.put<Cliente>(`${this.apiUrl}/${id}`, cliente);
  }

  // CONTACTOS
  getContactoByCliente(idCliente: number): Observable<ClienteContacto> {
    return this.http.get<ClienteContacto>(
      `${this.apiUrl}/contacto/${idCliente}`
    );
  }

  crearContacto(contacto: ClienteContacto): Observable<ClienteContacto> {
    return this.http.post<ClienteContacto>(`${this.apiUrl}/contacto`, contacto);
  }

  updateContacto(
    idCliente: number,
    contacto: ClienteContacto
  ): Observable<void> {
    return this.http.put<void>(
      `${this.apiUrl}/contacto/${idCliente}`,
      contacto
    );
  }

  // DOMICILIOS
  getDomiciliosByCliente(idCliente: number): Observable<ClienteDomicilio[]> {
    return this.http.get<ClienteDomicilio[]>(
      `${this.apiUrl}/domicilio/${idCliente}`
    );
  }

  crearDomicilio(domicilio: ClienteDomicilio): Observable<ClienteDomicilio> {
    return this.http.post<ClienteDomicilio>(
      `${this.apiUrl}/domicilio`,
      domicilio
    );
  }

  updateClienteDomicilio(
    idCliente: number,
    domicilio: ClienteDomicilio
  ): Observable<void> {
    return this.http.put<void>(
      `${this.apiUrl}/domicilio/${idCliente}`,
      domicilio
    );
  }

  // REPRESENTANTE LEGAL
  getRepresentanteByCliente(
    idCliente: number
  ): Observable<ClienteRepresentanteLegal> {
    return this.http.get<ClienteRepresentanteLegal>(
      `${this.apiUrl}/representantelegal/${idCliente}`
    );
  }

  crearRepresentanteLegal(
    representante: ClienteRepresentanteLegal
  ): Observable<ClienteRepresentanteLegal> {
    return this.http.post<ClienteRepresentanteLegal>(
      `${this.apiUrl}/representantelegal`,
      representante
    );
  }

  updateClienteRepresentante(
    idCliente: number,
    representante: ClienteRepresentanteLegal
  ): Observable<void> {
    return this.http.put<void>(
      `${this.apiUrl}/representantelegal/${idCliente}`,
      representante
    );
  }

  // SUCURSALES
  getSucursalesByCliente(idCliente: number): Observable<ClienteSucursal[]> {
    return this.http.get<ClienteSucursal[]>(
      `${this.apiUrl}/sucursal/${idCliente}`
    );
  }

  crearSucursal(sucursal: ClienteSucursal): Observable<ClienteSucursal> {
    return this.http.post<ClienteSucursal>(`${this.apiUrl}/sucursal`, sucursal);
  }

  updateClienteSucursal(idCliente: number, sucursal: ClienteSucursal): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/sucursal/${idCliente}`, sucursal);
  }
}
