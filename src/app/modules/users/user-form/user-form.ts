import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UsersService } from '../../../services/user-service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ValidationMessagesService } from '../../../services/validationMessages-service';
import { Observable } from 'rxjs';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzSpinModule } from 'ng-zorro-antd/spin';

@Component({
  selector: 'app-user-form',
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
  templateUrl: './user-form.html',
  styleUrl: './user-form.css',
})
export class UserFormComponente implements OnInit {
  userForm!: FormGroup;
  isLoading = false;
  modo: 'agregar' | 'editar' = 'agregar';
  passwordVisible = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private userService: UsersService,
    private message: NzMessageService,
    private validationMessagesService: ValidationMessagesService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const username = params.get('username');

      if (username) {
        this.modo = 'editar';
        this.cargarUsuario(username);
      } else {
        this.modo = 'agregar';
      }

      this.initForm();

      if (this.modo === 'agregar') {
        this.userForm
          .get('correoElectronico')
          ?.valueChanges.subscribe((email) => {
            if (email) {
              const atIndex = email.indexOf('@');
              const username =
                atIndex !== -1 ? email.substring(0, atIndex) : email;
              this.userForm.get('usuario')?.setValue(username);
            }
          });
      }
    });
  }

  private initForm(): void {
    const passwordPattern =
      /^(?=.{8,20}$)(?=.*[A-Z])(?=.*[a-z])(?=.*[#\$%&@*\/\+]).*$/;
    const passwordValidators =
      this.modo === 'agregar'
        ? [Validators.required, Validators.pattern(passwordPattern)]
        : [Validators.pattern(passwordPattern)];

    this.userForm = this.fb.group({
      id: [{ value: '', disabled: true }],
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
      segundoApellido: [
        '',
        [Validators.minLength(2), Validators.maxLength(50)],
      ],
      usuario: [
        { value: '', disabled: true },
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(100),
        ],
      ],
      correoElectronico: [
        { value: '', disabled: this.modo === 'editar' },
        [Validators.required, Validators.email, Validators.maxLength(100)],
      ],
      contraseña: ['', passwordValidators],
    });
  }

  private prepararDatosUsuario(): any {
    const formValue = this.userForm.getRawValue();

    const usuarioData: any = {
      firstName: formValue.nombre,
      lastName: formValue.primerApellido,
    };

    // Solo envia username y email en modo agregar
    if (this.modo === 'agregar') {
      usuarioData.username = formValue.usuario;
      usuarioData.email = formValue.correoElectronico;
      usuarioData.password = formValue.contraseña;
    }

    // Agrega el egundoApellido si tiene algún dato
    if (formValue.segundoApellido && formValue.segundoApellido.trim() !== '') {
      usuarioData.segundoApellido = formValue.segundoApellido;
    }

    // Solo envia la contraseña si se escribe una nueva una nueva
    if (
      this.modo === 'editar' &&
      formValue.contraseña &&
      formValue.contraseña.trim() !== ''
    ) {
      usuarioData.password = formValue.contraseña;
    }

    return usuarioData;
  }

  guardarUsuario(): void {
    if (!this.userForm.valid) {
      this.userForm.markAllAsTouched();
      this.message.warning('Por favor corrige los errores del formulario.');
      return;
    }

    this.isLoading = true;
    const usuarioData = this.prepararDatosUsuario();

    const saveObservable: Observable<any> =
      this.modo === 'editar' && this.userForm.getRawValue().usuario
        ? this.userService.actualizarUsuario(
            this.userForm.getRawValue().usuario,
            usuarioData
          )
        : this.userService.crearUsuario(usuarioData);
          console.log('Usuario data to save:', usuarioData);
    saveObservable.subscribe({
      next: () => this.handleSuccess(),
      error: (e) => this.handleError(e),
    });
  }

  private cargarUsuario(username: string): void {
    this.isLoading = true;
    this.userService.getUsuariosPorUsername(username).subscribe({
      next: (users: any) => {
        if (Array.isArray(users) && users.length > 0) {
          const user = users[0];
          // Mapear los campos del backend al formulario
          this.userForm.patchValue({
            nombre: user.firstName || '',
            primerApellido: user.lastName || '',
            segundoApellido: user.segundoApellido || '',
            usuario: user.username || '',
            correoElectronico: user.email || '',
            contraseña: '',
          });
        } else {
          this.message.error('Usuario no encontrado');
          this.router.navigate(['/usuario/consultar']);
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar usuario:', err);
        this.message.error(err.message || 'Error al cargar el usuario');
        this.isLoading = false;
      },
    });
  }

  onInput(event: Event) {
    const input = event.target as HTMLInputElement;
    input.value = input.value.replace(/\D/g, '');
  }

  getValidateStatus(fieldName: string): string {
    const control = this.userForm.get(fieldName);
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
    const control = this.userForm.get(fieldName);
    if (control?.errors && (control.touched || control.dirty)) {
      return this.validationMessagesService.getControlErrors(
        fieldName,
        control.errors
      );
    }
    return [];
  }

  cancelar(): void {
    this.router.navigate(['/usuario/consultar']);
  }

  private handleSuccess() {
    const message =
      this.modo === 'editar' ? 'Usuario actualizado' : 'Usuario guardado';
    this.router.navigate(['/usuario/consultar'], {
      queryParams: { actualizado: 'true' },
    });
  }

  private handleError(error: any) {
    this.isLoading = false;

    let errorMessage = 'Este usuario ya existe en el sistema.';

    // Estatus que viene del backend
    if (error.error?.message || error.error?.mensaje) {
      errorMessage = error.error.message || error.error.mensaje;
    } else if (error.message && !error.message.includes('Conflicto')) {
      errorMessage = error.message;
    }

    this.message.error(errorMessage);
  }
}
