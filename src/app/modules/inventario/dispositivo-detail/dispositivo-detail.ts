import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { Dispositivo, TipoDispositivo } from '../../../models/dispositivo';
import { DispositivoService } from '../../../services/dispositivo-service';
import { CatalogosService } from '../../../services/catalogos-service';
import { EmpleadoService } from '../../../services/empleado-service';
import { Empleado } from '../../../models/empleados';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-dispositivo-detail',
  standalone: true,
  imports: [
    NzLayoutModule,
    NzFormModule,
    NzInputModule,
    NzSelectModule,
    NzButtonModule,
    NzGridModule,
    NzIconModule,
    NzAlertModule,
    ReactiveFormsModule,
    NzSpinModule,
    NzDatePickerModule,
  ],
  templateUrl: './dispositivo-detail.html',
  styleUrls: ['./dispositivo-detail.css'],
})
export class DispositivoDetailComponente implements OnInit {
  inventarioForm!: FormGroup;
  dispositivoId!: number;
  isLoading = true;
  tipos: TipoDispositivo[] = [];
  empleados: Empleado[] = [];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private dispositivoService: DispositivoService,
    private tipoService: CatalogosService,
    private empleadoService: EmpleadoService,
    private message: NzMessageService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.cargarCatalogos();
    this.route.paramMap.subscribe((params) => {
      const idParam = params.get('id');
      if (idParam) {
        this.dispositivoId = +idParam;
        this.cargarDispositivo(this.dispositivoId);
      }
    });
  }

  initForm(): void {
    this.inventarioForm = this.fb.group({
      id: [null],
      idTipo: [null, Validators.required],
      marca: ['', Validators.required],
      modelo: ['', Validators.required],
      numSerie: [''],
      imei: [''],
      proveedor: [''],
      fechaCompra: [null],
      fechaTerminoGarantia: [null],
      idEmpleado: [null],
      comentarios: [''],
      fechaRegistro: [null],
    });
  }

  cargarCatalogos(): void {
    // Cargar tipos de dispositivos
    this.tipoService.getTiposDispositivo().subscribe({
      next: (tipos: TipoDispositivo[]) => (this.tipos = tipos),
      error: (err) => {
        this.message.error(err.message);
      },
    });
    // Cargar empleados
    this.empleadoService.getEmpleados().subscribe({
      next: (emps: Empleado[]) => (this.empleados = emps),
      error: (err) => {
        this.message.error(err.message);
      },
    });
  }

  cargarDispositivo(id: number): void {
    this.isLoading = true;
    this.dispositivoService.getDispositivoPorId(id).subscribe({
      next: (dispositivo: Dispositivo) => {
        const formData = {
          ...dispositivo,
          idTipo: dispositivo.tipo?.id ?? null,
          fechaCompra: dispositivo.fechaCompra
            ? new Date(dispositivo.fechaCompra)
            : null,
          fechaTerminoGarantia: dispositivo.fechaTerminoGarantia
            ? new Date(dispositivo.fechaTerminoGarantia)
            : null,
        };
        this.inventarioForm.patchValue(formData);
        this.isLoading = false;
      },
      error: (err) => {
        this.message.error(err.message);
      },
    });
  }

  regresar(): void {
    this.router.navigate(['/inventario/consultar-dispositivos']);
  }

  editar(): void {
    this.router.navigate([
      '/inventario/agregar-dispositivo',
      this.dispositivoId,
    ]);
  }

  // Obtiene el nombre del tipo
  get tipoNombre(): string {
    const idTipo = this.inventarioForm?.value?.idTipo;
    return this.tipos?.find((t) => t.id === idTipo)?.tipo || '';
  }

  // Obtiene el nombre del empleado
  get empleadoNombre(): string {
    const idEmp = this.inventarioForm?.value?.idEmpleado;
    const emp = this.empleados?.find((e) => e.id === idEmp);
    return emp
      ? `${emp.nombre} ${emp.primerApellido || ''} ${emp.segundoApellido || ''}`
      : '';
  }
}
