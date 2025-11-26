import { Component, OnInit } from '@angular/core';

import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { Dispositivo, TipoDispositivo } from '../../../models/dispositivo';
import { EmpleadoService } from '../../../services/empleado-service';
import { DispositivoService } from '../../../services/dispositivo-service';
import { NzAlertComponent } from 'ng-zorro-antd/alert';
import { CatalogosService } from '../../../services/catalogos-service';
import { Empleado } from '../../../models/empleados';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzMessageService } from 'ng-zorro-antd/message';
import { FormsModule } from '@angular/forms';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzInputModule } from 'ng-zorro-antd/input';
import { forkJoin, map } from 'rxjs';
import { KeycloakService } from '../../../keycloak/keycloak-service';
import { hasAnyRole, ROLE_GROUPS } from '../../../constants/roles.constants';

@Component({
  selector: 'app-dispositivo-list',
  standalone: true,
  imports: [
    NzTableModule,
    NzButtonModule,
    NzIconModule,
    NzAlertComponent,
    NzSpinModule,
    NzEmptyModule,
    FormsModule,
    NzDropDownModule,
    NzInputModule,
  ],
  templateUrl: './dispositivo-list.html',
  styleUrls: ['./dispositivo-list.css'],
})
export class DispositivoListComponente implements OnInit {
  dispositivos: (Dispositivo & { nombreTipo?: string; asignadoA?: string })[] =
    [];

  // Data mostrada (aplica filtros/ordenamientos)
  listOfDisplayData: (Dispositivo & {
    nombreTipo?: string;
    asignadoA?: string;
  })[] = [];

  tipos: TipoDispositivo[] = [];
  empleados: Empleado[] = [];
  showSuccessAlert = false;
  isLoading = true;

  // Unificamos las propiedades de búsqueda
  searchValueMarca = '';
  visibleMarca = false;

  searchValueAsignado = '';
  visibleAsignado = false;
  canAddDispositivo = false;
  canUpdateDispositivo = false;

  constructor(
    private dispositivoService: DispositivoService,
    private tipoService: CatalogosService,
    private empleadoService: EmpleadoService,
    private router: Router,
    private route: ActivatedRoute,
    private message: NzMessageService,
    private keycloakService: KeycloakService
  ) {}

  // Método para inicializar el componente y cargar los datos
  ngOnInit(): void {
    // Detectar si viene de un guardado exitoso y mandar el mensaje de éxito al la otra página
    this.route.queryParams.subscribe((params) => {
      if (params['actualizado'] === 'true') {
        this.showSuccessAlert = true;
        setTimeout(() => {
          this.showSuccessAlert = false;
        }, 2000);

        // Limpiar el parámetro de la URL
        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: {},
          replaceUrl: true,
        });
      }
    });

    this.cargarDatos();
    this.addDispositivo();
    this.updateDispositivo();
  }

  addDispositivo(): void {
    // El botón se muestra si NO tiene ningún rol de solo lectura
    this.canAddDispositivo = hasAnyRole(
      this.keycloakService,
      ROLE_GROUPS.INVENTARIO
    );
  }
  updateDispositivo(): void {
    // El botón se muestra si NO tiene ningún rol de solo lectura
    this.canUpdateDispositivo = hasAnyRole(
      this.keycloakService,
      ROLE_GROUPS.INVENTARIO
    );
  }

  // Método para cargar los tipos de dispositivos y empleados
  cargarDatos() {
    forkJoin([
      this.tipoService.getTiposDispositivo(),
      this.empleadoService.getEmpleados(),
    ]).subscribe({
      next: ([tipos, empleados]) => {
        this.tipos = tipos;
        this.empleados = empleados;
        const empleadosMap = new Map<number, Empleado>(
          empleados.map((e) => [e.id, e])
        );
        this.cargarDispositivosConDatos(empleadosMap);
      },
      error: (err) => {
        this.message.error(err.message);
        this.isLoading = false;
      },
    });
  }

  // Método para cargar los dispositivos con los datos de tipos y empleados
  cargarDispositivosConDatos(empleadosMap: Map<number, Empleado>) {
    // Muestra el Spinner antes de cargar los datos
    this.isLoading = true;
    this.dispositivoService.getDispositivos().subscribe({
      next: (dispositivos: Dispositivo[]) => {
        this.dispositivos = dispositivos.map((d) => {
          const empleado = d.idEmpleado
            ? empleadosMap.get(d.idEmpleado)
            : undefined;
          const nombreCompleto = empleado
            ? `${empleado.nombre} ${empleado.primerApellido || ''}`
            : 'No asignado';

          return {
            ...d,
            nombreTipo: d.tipo?.tipo ?? 'Desconocido',
            asignadoA: nombreCompleto.trim(),
          };
        });

        // Inicializar los datos mostrados
        this.listOfDisplayData = [...this.dispositivos];
        this.isLoading = false;
      },
      error: (err) => {
        this.message.error(err.message);
        this.isLoading = false;
      },
    });
  }

  // Método que maneja la navegación al formulario de agregar dispositivo
  onAgregar() {
    this.router.navigate(['/inventario/agregar-dispositivo']);
  }

  // Método para ver el detalle de un dispositivo
  onVer(dispositivo: Dispositivo) {
    this.router.navigate(['/inventario/detalle-dispositivo', dispositivo.id]);
  }

  // Método para editar un dispositivo
  onEditar(dispositivo: Dispositivo) {
    this.router.navigate(['/inventario/agregar-dispositivo', dispositivo.id]);
  }

  // BUSCADOR (Unificado)
  // Este método se llamará cada vez que cambie el valor de los inputs de búsqueda
  onSearch(): void {
    this.applyFilters();
  }

  resetFilters(): void {
    this.searchValueMarca = '';
    this.searchValueAsignado = '';
    this.applyFilters();
  }

  // Método para aplicar ambos filtros simultáneamente
  private applyFilters(): void {
    const marcaValue = this.searchValueMarca.trim().toLowerCase();
    const asignadoValue = this.searchValueAsignado.trim().toLowerCase();

    this.listOfDisplayData = this.dispositivos.filter((item) => {
      const marca = (item.marca ?? '').toLowerCase();
      const asignadoA = (item.asignadoA ?? '').toLowerCase();

      const matchesMarca = marca.includes(marcaValue);
      const matchesAsignado = asignadoA.includes(asignadoValue);

      return matchesMarca && matchesAsignado;
    });
  }

  // ORDENAMIENTO

  // Compara strings que podrían venir undefined
  private cmpStr(a?: string | null, b?: string | null): number {
    return (a ?? '').localeCompare(b ?? '');
  }

  // Comparadores usados en el template
  compararMarca = (
    a: Dispositivo & { nombreTipo?: string; asignadoA?: string },
    b: Dispositivo & { nombreTipo?: string; asignadoA?: string }
  ) => this.cmpStr(a?.marca, b?.marca);

  compararAsignadoA = (
    a: Dispositivo & { nombreTipo?: string; asignadoA?: string },
    b: Dispositivo & { nombreTipo?: string; asignadoA?: string }
  ) => this.cmpStr(a?.asignadoA, b?.asignadoA);
}
