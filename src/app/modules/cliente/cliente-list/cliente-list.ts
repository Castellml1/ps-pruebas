import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { FormsModule } from '@angular/forms';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { forkJoin } from 'rxjs';
import { Cliente, ClienteConInfo } from '../../../models/cliente';
import { Giro } from '../../../models/catalogos';
import { ClienteService } from '../../../services/cliente-service';
import { CatalogosService } from '../../../services/catalogos-service';
import { PhonePipe } from '../../../utils/phone.pipe';
import { KeycloakService } from '../../../keycloak/keycloak-service';
import { hasAnyRole, ROLE_GROUPS } from '../../../constants/roles.constants';

@Component({
  selector: 'app-cliente-list',
  standalone: true,
  imports: [
    FormsModule,
    NzTableModule,
    NzButtonModule,
    NzIconModule,
    NzSpinModule,
    NzEmptyModule,
    NzDropDownModule,
    NzInputModule,
    PhonePipe,
  ],
  templateUrl: './cliente-list.html',
  styleUrls: ['./cliente-list.css'],
})
export class ClienteListComponente implements OnInit {
  clientes: ClienteConInfo[] = [];

  listOfDisplayData: ClienteConInfo[] = [];
  isLoading = true;

  // Propiedades de búsqueda
  searchValueNombre = '';
  visibleNombre = false;
  searchValueId = '';
  visibleId = false;
  giros: Giro[] = [];
  canAddClient = false;
  canUpdateClient = false;
  constructor(
    private clienteService: ClienteService,
    private catalogosService: CatalogosService,
    private router: Router,
    private message: NzMessageService,
    private keycloakService: KeycloakService
  ) {}

  ngOnInit(): void {
    this.cargarDatos();
    this.addCiente();
    this.updateCiente();
  }

  addCiente(): void {
    // El botón se muestra si NO tiene ningún rol de solo lectura
    this.canAddClient = hasAnyRole(this.keycloakService, ROLE_GROUPS.CLIENTES);
  }
  updateCiente(): void {
    // El botón se muestra si NO tiene ningún rol de solo lectura
    this.canUpdateClient =
      hasAnyRole(this.keycloakService, ROLE_GROUPS.CLIENTES) ||
      hasAnyRole(this.keycloakService, ROLE_GROUPS.CLIENTES_READ_UPDATE);
  }

  // Carga clientes y giros, luego carga contactos y domicilios
  cargarDatos(): void {
    this.isLoading = true;

    forkJoin({
      clientesListado: this.clienteService.getClientesList(),
      giros: this.catalogosService.getGiros(),
    }).subscribe({
      next: (result) => {
        this.giros = result.giros ?? [];
        const clientesListado = result.clientesListado ?? [];

        // Mapea directamente cada registro del backend a un objeto para la tabla.
        this.clientes = clientesListado.map((item) => ({
          id: item.id,
          tipo: item.tipo,
          nombre: item.nombre,
          primerApellido: item.primerApellido,
          segundoApellido: item.segundoApellido,
          nombreComercial: item.nombreComercial,
          razonSocial: item.razonSocial,
          rfc: item.rfc,
          idGiro: item.idGiro,
          contacto: {
            telefono: item.telefono,
          },
          // Asigna el domicilio que viene en la lista si no hay será null o sin domicilio.
          domicilio: item.calleNumero
            ? {
                calleNumero: item.calleNumero,
                colonia: item.colonia,
                codigoPostal: item.codigoPostal,
                municipio: item.municipio,
                entidadFederativa: item.entidadFederativa,
              }
            : null,
        }));

        this.listOfDisplayData = [...this.clientes];
        this.isLoading = false;
      },
      error: (err) => {
        this.message.error(err?.message ?? 'Error al cargar datos');
        this.isLoading = false;
      },
    });
  }

  onAgregar(): void {
    this.router.navigate(['/cliente/registrar']);
  }

  onVer(cliente: Cliente): void {
    this.router.navigate(['/cliente/detalle', cliente.id]);
  }

  onEditar(cliente: ClienteConInfo): void {
    this.router.navigate(['/cliente/registrar', cliente.id], {
      queryParams: {},
    });
  }

  // Funciones para ordenamiento
  // Comparar strings (maneja null/undefined)
  private cmpStr(a?: string | null, b?: string | null): number {
    return (a ?? '').localeCompare(b ?? '');
  }

  private getNombreParaBusqueda(
    cliente: ClienteConInfo | Cliente | undefined | null
  ): string {
    if (!cliente) return '';
    // si es física usamos nombre + apellidos, si no usamos nombreComercial
    if (cliente.tipo === 'F') {
      return `${cliente.nombre ?? ''} ${cliente.primerApellido ?? ''} ${
        cliente.segundoApellido ?? ''
      }`.trim();
    }
    return cliente.nombreComercial ?? '';
  }

  compareNombre = (a: ClienteConInfo, b: ClienteConInfo) =>
    this.cmpStr(this.getNombreParaBusqueda(a), this.getNombreParaBusqueda(b));

  onSearch(): void {
    const searchId = this.searchValueId.trim().toLowerCase();
    const searchNombre = this.searchValueNombre.trim().toLowerCase();

    this.listOfDisplayData = this.clientes.filter((cliente) => {
      const id = String(cliente.id).toLowerCase();
      const nombre = this.getNombreParaBusqueda(cliente).toLowerCase();

      const matchesId = id.includes(searchId);
      const matchesNombre = nombre.includes(searchNombre);

      return matchesId && matchesNombre;
    });
  }

  resetSearch(): void {
    this.searchValueNombre = '';
    this.searchValueId = '';
    this.onSearch();
  }

  // Comparar giros por nombre
  compareGiro = (a: Cliente, b: Cliente) =>
    this.cmpStr(this.getNombreGiro(a?.idGiro), this.getNombreGiro(b?.idGiro));

  // Obtener nombre del giro por su ID
  getNombreGiro(idGiro?: number | null): string {
    if (!idGiro || !this.giros?.length) return '';

    const giro = this.giros.find((g) => g.id === idGiro);
    return giro?.giro ?? '';
  }
}
