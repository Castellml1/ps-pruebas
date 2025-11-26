import { Component, OnInit } from '@angular/core';
import { Empleado } from '../../../models/empleados';
import { ActivatedRoute, Router } from '@angular/router';
import { EmpleadoService } from '../../../services/empleado-service';
import { NzAlertComponent } from 'ng-zorro-antd/alert';
import { NzIconModule, NzIconService } from 'ng-zorro-antd/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzTableModule } from 'ng-zorro-antd/table';
import { CommonModule } from '@angular/common';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzMessageService } from 'ng-zorro-antd/message';
import { FormsModule } from '@angular/forms';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzInputModule } from 'ng-zorro-antd/input';
import { PhonePipe } from '../../../utils/phone.pipe';

@Component({
  selector: 'app-empleado-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzTableModule,
    NzButtonModule,
    NzIconModule,
    NzAlertComponent,
    NzSpinModule,
    NzEmptyModule,
    NzDropDownModule,
    NzInputModule,
    PhonePipe,
  ],

  templateUrl: './empleado-list.html',
  styleUrl: './empleado-list.css',
})
export class EmpleadoListComponente implements OnInit {
  empleados: Empleado[] = [];

  // Data mostrada (aplica filtros/ordenamientos)
  listOfDisplayData: Empleado[] = [];

  // Alert y loading
  showSuccessAlert = false;
  isLoading = true;

  // Propiedades de búsqueda
  searchValueNombre = '';
  visibleNombre = false;
  searchValueId = '';
  visibleId = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private empleadoService: EmpleadoService,
    private message: NzMessageService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      if (params['actualizado'] === 'true') {
        this.showSuccessAlert = true;
        setTimeout(() => (this.showSuccessAlert = false), 2000);

        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: {},
          replaceUrl: true,
        });
      }
    });

    this.cargarEmpleados();
  }

  // Carga de empleados
  cargarEmpleados(): void {
    this.isLoading = true;
    this.empleadoService.getEmpleados().subscribe({
      next: (empleados: Empleado[]) => {
        this.empleados = empleados ?? [];
        this.listOfDisplayData = [...this.empleados];
        this.isLoading = false;
      },
      error: (err) => {
        this.message.error(err?.message ?? 'Error al cargar empleados');
        this.isLoading = false;
      },
    });
  }

  // Navegación
  onAgregar(): void {
    this.router.navigate(['/empleado/registrar']);
  }
  onVer(empleado: Empleado): void {
    this.router.navigate(['/empleado/detalle', empleado.id]);
  }
  onEditar(empleado: Empleado): void {
    this.router.navigate(['/empleado/registrar', empleado.id]);
  }

  onSearch(): void {
    const searchId = this.searchValueId.trim().toLowerCase();
    const searchNombre = this.searchValueNombre.trim().toLowerCase();

    this.listOfDisplayData = this.empleados.filter((item) => {
      const id = String(item.id).toLowerCase();
      const nombreCompleto =
        `${item.nombre} ${item.primerApellido} ${
          item.segundoApellido || ''
        }`.toLowerCase();

      const matchesId = id.includes(searchId);
      const matchesNombre = nombreCompleto.includes(searchNombre);

      return matchesId && matchesNombre;
    });
  }

  resetSearch(): void {
    this.searchValueNombre = '';
    this.searchValueId = '';
    this.onSearch();
  }

  // ORDENAMIENTO

  // Compara strings que podrían venir undefined
  private cmpStr(a?: string | null, b?: string | null): number {
    return (a ?? '').localeCompare(b ?? '');
  }

  // Convierte fecha a ms
  private toTime(d?: string | Date | null): number {
    return d ? new Date(d).getTime() : 0;
  }

  // Comparadores usados en el template
  compareNombre = (a: Empleado, b: Empleado) =>
    this.cmpStr(
      `${a?.nombre ?? ''} ${a?.primerApellido ?? ''} ${
        a?.segundoApellido ?? ''
      }`.trim(),
      `${b?.nombre ?? ''} ${b?.primerApellido ?? ''} ${
        b?.segundoApellido ?? ''
      }`.trim()
    );

  compareFechaInicio = (a: Empleado, b: Empleado) =>
    this.toTime(a?.fechaInicio as any) - this.toTime(b?.fechaInicio as any);
}
