import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';

// NG-ZORRO
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSpinModule } from 'ng-zorro-antd/spin';

import { EmpleadoService } from '../../../services/empleado-service';
import { Empleado } from '../../../models/empleados';
import { ValidationMessagesService } from '../../../services/validationMessages-service';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'app-empleado-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NzLayoutModule,
    NzFormModule,
    NzInputModule,
    NzSelectModule,
    NzButtonModule,
    NzGridModule,
    NzIconModule,
    NzAlertModule,
    NzDatePickerModule,
    NzSpinModule,
  ],
  templateUrl: './empleado-form.html',
  styleUrls: ['./empleado-form.css'],
})
export class EmpleadoFormComponente implements OnInit {
  empleadoForm!: FormGroup;
  isLoading = false;
  modo: 'agregar' | 'editar' = 'agregar';
  empleadoId?: number;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private empleadoService: EmpleadoService,
    private message: NzMessageService,
    private validationMessagesService: ValidationMessagesService
  ) {}

  ngOnInit(): void {
    this.initForm();

    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.modo = 'editar';
        this.empleadoId = +id;
        this.cargarEmpleado(this.empleadoId);
      }
    });
  }

  private initForm(): void {
    this.empleadoForm = this.fb.group({
      id: [{value: '', disabled: true}],
      nombre: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50),
        ],
      ],
      primerApellido: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50),
        ],
      ],
      segundoApellido: [null, [Validators.maxLength(50)]],
      cargo: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(100),
        ],
      ],
      telefonoPersonal: [
        '',
        [Validators.required, Validators.pattern(/^\d{10}$/)],
      ],
      telefonoOficina: [null, [Validators.pattern(/^\d{10}$/)]],
      correoElectronico: [null, [Validators.email, Validators.maxLength(100)]],
      fechaInicio: [null, Validators.required],
      fechaTermino: [null],
    });
  }

  private cargarEmpleado(id: number): void {
    this.isLoading = true;
    this.empleadoService.getEmpleadoPorId(id).subscribe({
      next: (empleado: Empleado) => {
        this.empleadoForm.patchValue({
          ...empleado,
          fechaInicio: empleado.fechaInicio
            ? new Date(empleado.fechaInicio + 'T12:00:00')
            : null,
          fechaTermino: empleado.fechaTermino
            ? new Date(empleado.fechaTermino + 'T12:00:00')
            : null,
        });
        this.isLoading = false;
      },
      error: (err) => {
        this.message.error(err.message);
        this.isLoading = false;
      },
    });
  }

  onInput(event: Event) {
    const input = event.target as HTMLInputElement;
    input.value = input.value.replace(/\D/g, '');
  }

  getValidateStatus(fieldName: string): string {
    const control = this.empleadoForm.get(fieldName);
    if (!control) return '';

    if (fieldName === 'fechaInicio' || fieldName === 'fechaTermino') {
      if (!control.value) return '';
    } else {
      if (
        !control.value ||
        (typeof control.value === 'string' && control.value.trim() === '')
      ) {
        return '';
      }
    }

    if (control.valid) return 'success';
    if (control.invalid) return 'error';
    return '';
  }

  getFieldErrors(fieldName: string): string[] {
    const control = this.empleadoForm.get(fieldName);
    if (control?.errors && (control.touched || control.dirty)) {
      return this.validationMessagesService.getControlErrors(
        fieldName,
        control.errors
      );
    }
    return [];
  }

  guardarEmpleado(): void {
    if (!this.empleadoForm.valid) {
      this.empleadoForm.markAllAsTouched();
      this.message.warning('Por favor corrige los errores del formulario.');
      return;
    }

    this.isLoading = true;
    const empleadoData = this.prepararDatosEmpleado();

    const saveObservable: Observable<any> =
      this.modo === 'editar' && this.empleadoId
        ? this.empleadoService.actualizarEmpleado(this.empleadoId, empleadoData)
        : this.empleadoService.crearEmpleado(empleadoData);

    saveObservable.subscribe({
      next: () => this.handleSuccess(),
      error: (e) => this.handleError(e),
    });
  }

  private prepararDatosEmpleado(): Empleado {
    const formValue = this.empleadoForm.getRawValue(); 
    const empleado: Empleado = {
      ...formValue,
      fechaInicio: this.formatFecha(formValue.fechaInicio),
      fechaTermino: this.formatFecha(formValue.fechaTermino),
    };

    return empleado;
  }

  private formatFecha(fecha: any): string | undefined {
    if (!fecha) return undefined;
    return new Date(fecha).toISOString().split('T')[0];
  }

  cancelar(): void {
    this.router.navigate(['/empleado/consultar']);
  }

  private handleSuccess() {
    const message = this.modo === 'editar' ? 'Empleado actualizado' : 'Empleado guardado';
    this.router.navigate(['/empleado/consultar'], {
      queryParams: { actualizado: 'true' },
    });
  }

  private handleError(err: any) {
    this.isLoading = false;
    this.message.error(err?.message || 'Ocurrió un error al guardar el empleado.');
  }
}
