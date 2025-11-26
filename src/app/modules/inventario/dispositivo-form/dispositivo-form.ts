import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { forkJoin } from 'rxjs';
import { format } from 'date-fns';
import { DispositivoService } from '../../../services/dispositivo-service';
import { EmpleadoService } from '../../../services/empleado-service';
import { CatalogosService } from '../../../services/catalogos-service';
import { Dispositivo } from '../../../models/dispositivo';
import { ValidationMessagesService } from '../../../services/validationMessages-service';

import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';

@Component({
  selector: 'app-dispositivo-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzSelectModule,
    NzButtonModule,
    NzSpinModule,
    NzAlertModule,
    NzDatePickerModule,
  ],
  templateUrl: './dispositivo-form.html',
  styleUrls: ['./dispositivo-form.css'],
})
export class DispositivoFormComponente implements OnInit {
  inventarioForm!: FormGroup;
  isLoading = false;
  modo: 'agregar' | 'editar' = 'agregar';
  dispositivoId?: number;

  tiposDispositivoOptions: { label: string; value: number }[] = [];
  empleadosOptions: { label: string; value: number }[] = [];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private dispositivoService: DispositivoService,
    private empleadoService: EmpleadoService,
    private catalogosService: CatalogosService,
    private message: NzMessageService,
    private validationService: ValidationMessagesService
  ) {}

  ngOnInit(): void {
    this.initForm();

    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.modo = 'editar';
        this.dispositivoId = +id;
        this.cargarDispositivo(this.dispositivoId);
      }
    });

    this.cargarCatalogos();
  }

  private initForm(): void {
    this.inventarioForm = this.fb.group({
      id_tipo: [null, [Validators.required]],
      marca: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50),
        ],
      ],
      modelo: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50),
        ],
      ],
      numSerie: [null, [Validators.pattern(/^[a-zA-Z0-9\-]{8,20}$/)]],
      imei: [null, [Validators.pattern(/^\d{15}$/)]],
      proveedor: [null, [Validators.maxLength(100)]],
      fechaCompra: [null],
      fechaTerminoGarantia: [null],
      idEmpleado: [null],
      comentarios: [null, [Validators.maxLength(500)]],
    });
  }

  private cargarDispositivo(id: number): void {
    this.isLoading = true;
    this.dispositivoService.getDispositivoPorId(id).subscribe({
      next: (dispositivo: Dispositivo) => {
        this.inventarioForm.patchValue({
          id_tipo: dispositivo.tipo?.id || null,
          marca: dispositivo.marca,
          modelo: dispositivo.modelo,
          numSerie: dispositivo.numSerie,
          imei: dispositivo.imei,
          proveedor: dispositivo.proveedor,
          fechaCompra: dispositivo.fechaCompra
            ? new Date(dispositivo.fechaCompra)
            : null,
          fechaTerminoGarantia: dispositivo.fechaTerminoGarantia
            ? new Date(dispositivo.fechaTerminoGarantia)
            : null,
          idEmpleado: dispositivo.idEmpleado || null,
          comentarios: dispositivo.comentarios,
        });
        this.isLoading = false;
      },
      error: (err) => {
        this.message.error(err.message || 'Error al cargar dispositivo');
        this.isLoading = false;
      },
    });
  }

  private cargarCatalogos(): void {
    forkJoin({
      tipos: this.catalogosService.getTiposDispositivo(),
      empleados: this.empleadoService.getEmpleados(),
    }).subscribe({
      next: ({ tipos, empleados }) => {
        this.tiposDispositivoOptions = tipos
          .filter((t) => t.tipo !== undefined && t.id !== undefined)
          .map((t) => ({ label: t.tipo || '', value: t.id }));

        this.empleadosOptions = empleados
          .filter((e) => e.id !== undefined)
          .map((e) => ({
            label: `${e.nombre} ${e.primerApellido || ''} ${
              e.segundoApellido || ''
            }`.trim(),
            value: e.id,
          }));
      },
      error: (err) =>
        this.message.error(err.message || 'Error al cargar catálogos'),
    });
  }

  onInput(event: Event) {
    const input = event.target as HTMLInputElement;
    input.value = input.value.replace(/\D/g, '');
  }

  getValidateStatus(fieldName: string): string {
    const control = this.inventarioForm.get(fieldName);
    if (!control) return '';

    if (
      !control.value ||
      (typeof control.value === 'string' && control.value.trim() === '')
    )
      return '';

    return control.valid ? 'success' : 'error';
  }

  getFieldErrors(fieldName: string): string[] {
    const control = this.inventarioForm.get(fieldName);
    if (control?.errors && (control.touched || control.dirty)) {
      return this.validationService.getControlErrors(fieldName, control.errors);
    }
    return [];
  }

  guardarInventario(): void {
    if (this.inventarioForm.invalid) {
      this.inventarioForm.markAllAsTouched();
      this.message.warning('Por favor corrige los errores del formulario.');
      return;
    }

    this.isLoading = true;
    const formValue = this.inventarioForm.value;
    const tipoSeleccionado =
      this.tiposDispositivoOptions.find((t) => t.value === formValue.id_tipo)
        ?.label || '';

    // Formatear fechas a YYYY-MM-DD antes de enviar
    const fechaCompraFmt = formValue.fechaCompra
      ? format(formValue.fechaCompra, 'yyyy-MM-dd')
      : null;
    const fechaTerminoGarantiaFmt = formValue.fechaTerminoGarantia
      ? format(formValue.fechaTerminoGarantia, 'yyyy-MM-dd')
      : null;

    let dispositivo: Dispositivo = {
      tipo: { id: formValue.id_tipo, tipo: tipoSeleccionado },
      marca: formValue.marca,
      modelo: formValue.modelo,
      numSerie: formValue.numSerie,
      imei: formValue.imei,
      proveedor: formValue.proveedor,
      fechaCompra: fechaCompraFmt as string,
      fechaTerminoGarantia: fechaTerminoGarantiaFmt as string,
      comentarios: formValue.comentarios,
      idEmpleado: formValue.idEmpleado,
    };

    if (this.modo === 'editar' && this.dispositivoId) {
      dispositivo.fechaActualizacion = new Date().toISOString();
      dispositivo.usuarioActualizacion = 'admin'; // Reemplazar con el usuario real

      this.dispositivoService
        .actualizarDispositivo(this.dispositivoId, dispositivo)
        .subscribe({
          next: () => {
            this.isLoading = false;
            this.router.navigate(['inventario/consultar-dispositivos'], {
              queryParams: { actualizado: 'true' },
            });
          },
          error: (err) => {
            this.isLoading = false;
            this.message.error(
              err.message || 'Error al actualizar dispositivo'
            );
          },
        });
    } else {
      dispositivo.fechaRegistro = new Date().toISOString();
      dispositivo.usuarioRegistro = 'admin'; // Reemplazar con el usuario real

      this.dispositivoService.crearDispositivo(dispositivo).subscribe({
        next: () => {
          this.isLoading = false;
          this.router.navigate(['inventario/consultar-dispositivos'], {
            queryParams: { actualizado: 'true' },
          });
        },
        error: (err) => {
          this.isLoading = false;
          this.message.error(err.message || 'Error al crear dispositivo');
        },
      });
    }
  }

  cancelar(): void {
    this.router.navigate(['/inventario/consultar-dispositivos']);
  }
}
