import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { RolService } from '../../../services/rol-service';
import { ValidationMessagesService } from '../../../services/validationMessages-service';
import { NzMessageService } from 'ng-zorro-antd/message';

import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { Rol } from '../../../models/roles';

@Component({
  selector: 'app-rol-form',
  imports: [
    ReactiveFormsModule,
    NzLayoutModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzGridModule,
    NzSpinModule,
  ],
  templateUrl: './rol-form.html',
  styleUrl: './rol-form.css',
})
export class RolFormComponente implements OnInit {
  private crearRol(rol: Rol): void {
    this.rolService.crearRol(rol).subscribe({
      next: () => this.handleSuccess(),
      error: (error) => this.handleError(error),
    });
  }
  rolForm!: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private rolService: RolService,
    private message: NzMessageService,
    private validationMessagesService: ValidationMessagesService
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.rolForm = this.fb.group({
      name: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50),
          Validators.pattern(/^[a-zA-Z_][a-zA-Z0-9_]*$/),
        ],
      ],
      description: ['', [Validators.maxLength(100)]],
    });
  }

  getValidateStatus(fieldName: string): string {
    const control = this.rolForm.get(fieldName);
    if (control && control.touched && control.invalid) {
      return 'error';
    }
    return '';
  }

  getFieldErrors(fieldName: string): string[] {
    const control = this.rolForm.get(fieldName);
    if (control && control.errors && (control.touched || control.dirty)) {
      return this.validationMessagesService.getControlErrors(
        fieldName,
        control.errors
      );
    }
    return [];
  }

  guardarRol(): void {
    if (this.rolForm.invalid) {
      Object.values(this.rolForm.controls).forEach((control) => {
        if (control.invalid) {
          control.markAsTouched();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
      this.message.warning('Por favor corrige los errores del formulario.');
      return;
    }

    this.isLoading = true;

    const rolData: Rol = {
      name: this.rolForm.get('name')?.value,
      description: this.rolForm.get('description')?.value || '',
    };

    this.crearRol(rolData);
  }

  cancelar(): void {

    this.router.navigate(['/rol/consultar']);
  }

  private handleSuccess() {
    this.isLoading = false;
    this.router.navigate(['/rol/consultar'], {
      queryParams: { creado: 'true' },
    });
  }

  private handleError(error: any) {
    this.isLoading = false;
    let errorMessage = 'Este rol ya existe en el sistema.';
    if (error.error?.message || error.error?.mensaje) {
      errorMessage = error.error.message || error.error.mensaje;
    } else if (error.message && !error.message.includes('Conflicto')) {
      errorMessage = error.message;
    }
    this.message.error(errorMessage);
  }
  

}

