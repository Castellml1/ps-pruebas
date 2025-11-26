import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EmpleadoService } from '../../../services/empleado-service';

import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { Empleado } from '../../../models/empleados';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-empleado-detail',
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
    NzDatePickerModule,
    NzSpinModule,
  ],
  templateUrl: './empleado-detail.html',
  styleUrl: './empleado-detail.css',
})
export class EmpleadoDetailComponente implements OnInit {
  empleadoForm!: FormGroup;
  empleadoId!: number;
  isLoading = true;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private empleadoService: EmpleadoService,
    private message: NzMessageService
  ) {}

  ngOnInit(): void {
    this.initForm();

    // Obtener ID desde la URL
    this.route.paramMap.subscribe((params) => {
      const idParam = params.get('id');
      if (idParam) {
        this.empleadoId = +idParam;
        this.cargarEmpleado(this.empleadoId);
      }
    });
  }

  initForm(): void {
    this.empleadoForm = this.fb.group({
      id: [null],
      usuario: [null],
      nombre: [''],
      primerApellido: [''],
      segundoApellido: [''],
      cargo: [''],
      telefonoPersonal: [''],
      telefonoOficina: [''],
      correoElectronico: [''],
      fechaInicio: [null],
      fechaTermino: [null],
      fechaRegistro: [null],
      usuarioRegistro: [null],
    });
  }

  cargarEmpleado(id: number): void {
    this.isLoading = true;
    this.empleadoService.getEmpleadoPorId(id).subscribe({
      next: (empleado: Empleado) => {
        this.empleadoForm.patchValue({
          ...empleado,
          // Agregar T12:00:00 evita que reste un día por timezone
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
      },
    });
  }

  regresar(): void {
    this.router.navigate(['/empleado/consultar']);
  }
}
