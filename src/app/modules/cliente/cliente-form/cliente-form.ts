import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ClienteService } from '../../../services/cliente-service';
import { CatalogosService } from '../../../services/catalogos-service';
import { Cliente } from '../../../models/cliente';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzTableModule } from 'ng-zorro-antd/table';
import { BehaviorSubject, Observable } from 'rxjs';
import { debounceTime, switchMap } from 'rxjs/operators';
import { ValidationMessagesService } from '../../../services/validationMessages-service';
import { ActivatedRoute, Router } from '@angular/router';
import { PhonePipe } from '../../../utils/phone.pipe';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-cliente-form',
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
    NzCheckboxModule,
    NzTableModule,
    PhonePipe,
    NzDropDownModule,
    NzEmptyModule,
    NzModalModule,
  ],
  templateUrl: './cliente-form.html',
  styleUrls: ['./cliente-form.css'],
})
export class ClienteFormComponente implements OnInit {
  // PROPIEDADES DE ESTADO Y CONFIGURACIÓN
  formularioCliente!: FormGroup;
  isLoading = false;
  currentStep = 0;
  esEmpresa = false;
  step1Guardado = false;
  isContactoGuardado: boolean = false;
  isDomicilioGuardado: boolean = false;
  isDomicilioFiscalGuardado: boolean = false;
  isRepresentanteGuardado: boolean = false;
  isSucursalGuardado: boolean = false;
  clienteId?: number; // ID generado al guardar el primer formulario
  isEditMode = false;
  clienteExistente: Cliente | null = null;
  isEditModeContacto = false;
  contactoExistente: any = null;
  isEditModeDomicilio = false;
  domicilioExistente: any = null;
  isEditModeDomicilioFiscal = false;
  domicilioFiscalExistente: any = null;
  isEditModeRepresentante = false;
  representanteExistente: any = null;
  isEditModeSucursal = false;
  sucursalSeleccionadaId: number | null = null;

  steps = [
    'Información Personal',
    'Contacto',
    'Domicilio',
    'Domicilio fiscal',
    'Representante legal',
    'Sucursales',
  ];

  tipoCliente = [
    { id: 'F', tipo_cliente: 'Persona Física' },
    { id: 'M', tipo_cliente: 'Persona Moral' },
  ];

  sucursalesCliente: any[] = [];
  agregarSucursal = false;
  private _searchValueSucursal = '';
  private _searchValueSucursalCalle = '';
  private _searchValueSucursalEncargado = '';
  private _searchValueSucursalTelefono = '';
  visibleSucursal = false;
  visibleSucursalCalle = false;
  visibleSucursalEncargado = false;
  visibleSucursalTelefono = false;
  pageSizeSucursal = 5;
  pageIndexSucursal = 1;
  totalSucursales = 0;
  listOfDisplayDataSucursales: any[] = [];

  // CATÁLOGOS Y LISTAS
  catalogoGiros: any[] = [];
  catalogoEntidades: any[] = [];
  catalogoMunicipios: any[] = [];
  catalogoMunicipiosFiscal: any[] = [];
  entidadesFiltradas: any[] = [];
  municipiosFiltrados: any[] = [];
  municipiosFiltradosFiscal: any[] = [];
  municipiosFiltradosSucursal: any[] = [];

  // BEHAVIORSUBJECTS Y PROPIEDADES DE BÚSQUEDA
  entidadSearchChange$ = new BehaviorSubject('');
  municipioSearchChange$ = new BehaviorSubject('');
  municipioFiscalSearchChange$ = new BehaviorSubject('');
  entidadSucursalSearchChange$ = new BehaviorSubject('');
  municipioSucursalSearchChange$ = new BehaviorSubject('');

  // Estados de carga
  loadingEntidades = false;
  loadingMunicipios = false;
  loadingEntidadesSucursal = false;
  loadingMunicipiosSucursal = false;
  clienteData: any = {};
  contactoData: any = {};
  domicilioData: any = {};
  domicilioFiscalData: any = {};
  representanteData: any = {};
  sucursalesData: any = {};

  constructor(
    private fb: FormBuilder,
    private message: NzMessageService,
    private catalogosService: CatalogosService,
    private clienteService: ClienteService,
    private validationMessagesService: ValidationMessagesService,
    private router: Router,
    private route: ActivatedRoute,
    private modal: NzModalService
  ) {}

  ngOnInit(): void {
    this.formularioCliente = this.fb.group({
      // Cliente principal
      id: [{ value: '', disabled: true }],
      numeroCliente: [''],
      tipo: ['F', Validators.required],
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
      nombreComercial: [
        '',
        [Validators.minLength(2), Validators.maxLength(100)],
      ],
      razonSocial: ['', [Validators.minLength(2), Validators.maxLength(100)]],
      rfc: [
        '',
        [
          Validators.required,
          Validators.minLength(12),
          Validators.maxLength(13),
        ],
      ],
      idGiro: [null, Validators.required],

      // Contacto
      nombreContacto: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50),
        ],
      ],
      apellidosContacto: [
        '',
        [Validators.minLength(2), Validators.maxLength(50)],
      ],
      telefonoContacto: [
        '',
        [Validators.required, Validators.pattern(/^\d{10}$/)],
      ],
      telefonoAdicionalContacto: ['', [Validators.pattern(/^\d{10}$/)]],
      correoContacto: [
        '',
        [Validators.required, Validators.email, Validators.maxLength(100)],
      ],

      // Domicilio
      calleNumero: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(100),
        ],
      ],
      colonia: ['', [Validators.minLength(2), Validators.maxLength(50)]],
      codigoPostal: ['', [Validators.required, Validators.pattern(/^\d{5}$/)]],
      entidadFederativa: [null, Validators.required],
      municipio: [{ value: null, disabled: true }, Validators.required],
      esFiscal: [false],

      // Domicilio fiscal
      calleNumeroFiscal: ['', [Validators.required, Validators.maxLength(100)]],
      coloniaFiscal: ['', [Validators.minLength(2), Validators.maxLength(50)]],
      codigoPostalFiscal: [
        '',
        [Validators.required, Validators.pattern(/^\d{5}$/)],
      ],
      entidadFederativaFiscal: [null, Validators.required],
      municipioFiscal: [{ value: null, disabled: true }, Validators.required],
      esDomFiscal: [true],

      // Representante legal
      nombreRepresentante: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50),
        ],
      ],
      primerApellidoRepresentante: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50),
        ],
      ],
      segundoApellidoRepresentante: [
        '',
        [Validators.minLength(2), Validators.maxLength(50)],
      ],
      telefonoMovilRepresentante: [
        '',
        [Validators.required, Validators.pattern(/^\d{10}$/)],
      ],
      telefonoOficinaRepresentante: ['', [Validators.pattern(/^\d{10}$/)]],
      extensionOficinaRepresentante: ['', [Validators.maxLength(10)]],
      correoRepresentante: ['', [Validators.email, Validators.maxLength(100)]],

      // Sucursales
      nombreSucursal: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(100),
        ],
      ],
      calleSucursal: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(100),
        ],
      ],
      coloniaSucursal: [
        '',
        [Validators.minLength(2), Validators.maxLength(50)],
      ],
      codigoPostalSucursal: [
        '',
        [Validators.required, Validators.pattern(/^\d{5}$/)],
      ],
      entidadFederativaSucursal: [null, Validators.required],
      municipioSucursal: [null, Validators.required],
      personaEncargadaSucursal: [
        '',
        [Validators.required, Validators.maxLength(100)],
      ],
      telefonoSucursal: [
        '',
        [Validators.required, Validators.pattern(/^\d{10}$/)],
      ],
    });

    this.cargarCatalogos();
    this.configurarBusquedas();
    this.setupFormListeners();

    // Transformar RFC a mayúsculas
    this.formularioCliente.get('rfc')?.valueChanges.subscribe((val: string) => {
      if (val) {
        const upper = val.toUpperCase();
        if (val !== upper) {
          this.formularioCliente
            .get('rfc')
            ?.setValue(upper, { emitEvent: false });
        }
      }
    });

    // Detectar si estamos en modo edición (URL con ID)
    this.route.paramMap.subscribe((params) => {
      const idParam = params.get('id');
      if (idParam) {
        const clienteId = +idParam;
        this.isEditMode = true;
        this.clienteId = clienteId;

        // Cargar todos los datos del cliente
        this.cargarClienteExistente(clienteId);
      }
    });

    this.route.queryParamMap.subscribe((queryParams) => {
      const modo = queryParams.get('modo');
      const paso = queryParams.get('paso');
      const sucursalId = queryParams.get('sucursalId');

      if (modo === 'editar' && paso === 'sucursales' && sucursalId) {
        this.agregarSucursal = true; // Mostrar el formulario de sucursal
        this.isEditModeSucursal = true;
        this.sucursalSeleccionadaId = +sucursalId;
      }
    });
  }

  // Manejo de cambios en los selecs de tipo persona
  onTipoChange(tipo: string) {
    // Ajustar validaciones según tipo de cliente
    this.esEmpresa = tipo === 'M';
    const nombreComercialCtrl = this.formularioCliente.get('nombreComercial');
    const razonSocialCtrl = this.formularioCliente.get('razonSocial');
    const nombreCtrl = this.formularioCliente.get('nombre');
    const primerApellidoCtrl = this.formularioCliente.get('primerApellido');
    const segundoApellidoCtrl = this.formularioCliente.get('segundoApellido');
    const rfcCtrl = this.formularioCliente.get('rfc');

    if (this.esEmpresa) {
      // Validadores para empresa
      nombreComercialCtrl?.setValidators([
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(100),
      ]);
      razonSocialCtrl?.setValidators([
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(100),
      ]);
      rfcCtrl?.setValidators([
        Validators.required,
        Validators.minLength(12),
        Validators.maxLength(12),
        Validators.pattern(
          '^[A-Z&Ñ]{3}[0-9]{2}(0[1-9]|1[0-2])(0[1-9]|[12][0-9]|3[01])[A-Z0-9]{3}$'
        ),
      ]);

      // Limpiar validadores de persona física
      nombreCtrl?.clearValidators();
      primerApellidoCtrl?.clearValidators();
      segundoApellidoCtrl?.clearValidators();
    } else {
      // Validadores para persona física
      nombreCtrl?.setValidators([
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50),
      ]);
      primerApellidoCtrl?.setValidators([
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50),
      ]);
      segundoApellidoCtrl?.setValidators([
        Validators.minLength(2),
        Validators.maxLength(50),
      ]);
      rfcCtrl?.setValidators([
        Validators.required,
        Validators.minLength(13),
        Validators.maxLength(13),
        Validators.pattern(
          '^[A-Z&Ñ]{4}[0-9]{2}(0[1-9]|1[0-2])(0[1-9]|[12][0-9]|3[01])[A-Z0-9]{3}$'
        ),
      ]);

      // Limpiar validadores de empresa
      nombreComercialCtrl?.clearValidators();
      razonSocialCtrl?.clearValidators();

      // Ajustar el paso en el flujo
      if (this.currentStep > 3) this.currentStep = 3;
    }

    // Habilitar el municipio de sucursal si hay entidad seleccionada
    const entidadSucursal = this.formularioCliente.get(
      'entidadFederativaSucursal'
    )?.value;
    if (entidadSucursal) {
      this.formularioCliente.get('municipioSucursal')?.enable();
    }

    nombreComercialCtrl?.updateValueAndValidity();
    razonSocialCtrl?.updateValueAndValidity();
    nombreCtrl?.updateValueAndValidity();
    primerApellidoCtrl?.updateValueAndValidity();
    segundoApellidoCtrl?.updateValueAndValidity();
    rfcCtrl?.updateValueAndValidity();
  }

  private limpiarDatosMoralAFisica(): void {
    // Limpiar datos del formulario de representante legal
    this.formularioCliente.patchValue({
      nombreRepresentante: '',
      primerApellidoRepresentante: '',
      segundoApellidoRepresentante: '',
      telefonoMovilRepresentante: '',
      telefonoOficinaRepresentante: '',
      extensionOficinaRepresentante: '',
      correoRepresentante: '',
    });

    // Limpiar datos del formulario de sucursales
    this.formularioCliente.patchValue({
      nombreSucursal: '',
      calleSucursal: '',
      coloniaSucursal: '',
      codigoPostalSucursal: '',
      entidadFederativaSucursal: null,
      municipioSucursal: null,
      personaEncargadaSucursal: '',
      telefonoSucursal: '',
    });

    // Limpiar listas de sucursales
    this.sucursalesCliente = [];
    this.listOfDisplayDataSucursales = [];
    this.totalSucursales = 0;

    // Resetear estados de edición
    this.isEditModeRepresentante = false;
    this.representanteExistente = null;
    this.isEditModeSucursal = false;
    this.sucursalSeleccionadaId = null;
    this.agregarSucursal = false;

    // Resetear validaciones de los campos limpios
    const camposRepresentante = [
      'nombreRepresentante',
      'primerApellidoRepresentante',
      'segundoApellidoRepresentante',
      'telefonoMovilRepresentante',
      'telefonoOficinaRepresentante',
      'extensionOficinaRepresentante',
      'correoRepresentante',
    ];

    const camposSucursal = [
      'nombreSucursal',
      'calleSucursal',
      'coloniaSucursal',
      'codigoPostalSucursal',
      'entidadFederativaSucursal',
      'municipioSucursal',
      'personaEncargadaSucursal',
      'telefonoSucursal',
    ];

    // Resetear estado de validación de los campos
    [...camposRepresentante, ...camposSucursal].forEach((campo) => {
      const control = this.formularioCliente.get(campo);
      if (control) {
        control.markAsUntouched();
        control.markAsPristine();
        control.setErrors(null);
      }
    });

    console.log('Datos de Persona Moral limpiados después del cambio a Física');
  }

  onTipoChangeWithConfirmation(nuevoTipo: string): void {
    // al cambiar de Moral a Física
    if (
      this.isEditMode &&
      this.clienteExistente?.tipo === 'M' &&
      nuevoTipo === 'F'
    ) {
      this.modal.confirm({
        nzClassName: 'custom-modal',
        nzClosable: false,
        nzTitle: '¿Estás seguro de cambiar el tipo de cliente?',
        nzContent:
          'Al cambiar de Persona Moral a Persona Física, se perderán los datos del representante legal y las sucursales. Esta acción no se puede deshacer.',
        nzOkText: 'Sí, cambiar',
        nzOkType: 'primary',
        nzOkDanger: true,
        nzCancelText: 'Cancelar',
        nzOnOk: () => {
          // Si el usuario confirma, se aplica el cambio
          this.onTipoChange(nuevoTipo);
        },
        nzOnCancel: () => {
          // Si cancela, se regresa a el valor anterior
          this.formularioCliente
            .get('tipo')
            ?.setValue('M', { emitEvent: false });
        },
      });
    } else {
      // Para persona física o sin edición previa, aplicar el cambio directamente
      this.onTipoChange(nuevoTipo);
    }
  }

  // Manejo de cambios en selects de entidad federativa
  onEstadoChange(claveEntidad: string) {
    if (!claveEntidad) {
      this.catalogoMunicipios = [];
      this.municipiosFiltrados = [];
      this.formularioCliente.get('municipio')?.disable();
      return;
    }
    this.catalogosService.getMunicipiosPorEntidad(claveEntidad).subscribe({
      next: (data) => {
        this.catalogoMunicipios = data;
        this.municipiosFiltrados = [...data];
        this.formularioCliente.get('municipio')?.enable();
        this.formularioCliente.patchValue({ municipio: null });
      },
      error: () => this.message.error('Error al cargar municipios'),
    });
  }

  // Manejo de cambios en selects de entidad federativa para sucursal
  onEstadoFiscalChange(claveEntidad: string) {
    if (!claveEntidad) {
      this.catalogoMunicipiosFiscal = [];
      this.municipiosFiltradosFiscal = [];
      this.formularioCliente.get('municipioFiscal')?.disable();
      this.formularioCliente.get('municipioFiscal')?.setValue(null);
      return;
    }

    this.catalogosService.getMunicipiosPorEntidad(claveEntidad).subscribe({
      next: (data) => {
        this.catalogoMunicipiosFiscal = data; // Guardar la lista completa
        this.municipiosFiltradosFiscal = [...data]; // Usar una copia para la filtración
        this.formularioCliente.get('municipioFiscal')?.enable();
        this.formularioCliente.patchValue({ municipioFiscal: null });
      },
      error: () =>
        this.message.error('Error al cargar municipios del domicilio fiscal'),
    });
  }

  // Manejo de cambios en selects de entidad federativa para sucursal
  onEstadoSucursalChange(claveEntidad: string) {
    if (!claveEntidad) {
      this.municipiosFiltradosSucursal = [];
      this.formularioCliente.get('municipioSucursal')?.setValue(null);
      this.formularioCliente.get('municipioSucursal')?.disable();
      return;
    }

    this.loadingMunicipiosSucursal = true;

    this.catalogosService.getMunicipiosPorEntidad(claveEntidad).subscribe({
      next: (data) => {
        this.municipiosFiltradosSucursal = data;
        this.formularioCliente.get('municipioSucursal')?.enable();
        this.formularioCliente.get('municipioSucursal')?.setValue(null);
        this.loadingMunicipiosSucursal = false;
      },
      error: (error) => {
        console.error('Error al cargar municipios:', error);
        this.loadingMunicipiosSucursal = false;
        this.message.error('Error al cargar municipios de sucursal');
      },
    });
  }

  // Manejo de input para solo números
  onInput(event: Event) {
    const input = event.target as HTMLInputElement;
    input.value = input.value.replace(/\D/g, '');
  }

  onEntidadSearch(value: string) {
    this.entidadSearchChange$.next(value);
  }

  onMunicipioSearch(value: string) {
    this.municipioSearchChange$.next(value);
  }

  onEntidadFiscalSearch(value: string) {
    this.entidadSearchChange$.next(value);
  }

  onMunicipioFiscalSearch(value: string) {
    this.municipioFiscalSearchChange$.next(value);
  }

  onEntidadSucursalSearch(value: string) {
    this.entidadSucursalSearchChange$.next(value);
  }

  onMunicipioSucursalSearch(value: string) {
    this.municipioSucursalSearchChange$.next(value);
  }

  // === NAVEGACIÓN ===

  // Navegación entre steps
  showStep(index: number) {
    if (this.isStepEnabled(index)) this.currentStep = index;
  }

  // Verificar si un step está habilitado
  isStepEnabled(stepIndex: number): boolean {
    if (stepIndex === 0) return true;
    if (!this.step1Guardado) return false;
    return this.esEmpresa ? true : stepIndex <= 3;
  }

  //=== GUARDADOS ===

  // Metodos de guardado para cliente
  guardarCliente(): void {
    // Validación adicional para empresas
    const camposRequeridos = ['tipo', 'rfc', 'idGiro'];

    if (this.esEmpresa) {
      camposRequeridos.push('razonSocial', 'nombreComercial');
    } else {
      camposRequeridos.push('nombre', 'primerApellido');
    }

    for (const campo of camposRequeridos) {
      const control = this.formularioCliente.get(campo);
      if (control && control.invalid) {
        control.markAllAsTouched();
        this.message.warning(
          'Por favor, completa todos los campos requeridos.'
        );
        return;
      }
    }

    const tipoActualFormulario = this.formularioCliente.get('tipo')?.value;

    // Si se cambia de Persona Moral a Física en modo edición, mostrar confirmación.
    if (
      this.isEditMode &&
      this.clienteExistente?.tipo === 'M' &&
      tipoActualFormulario === 'F'
    ) {
      this.modal.confirm({
        nzClassName: 'custom-modal',
        nzClosable: false,
        nzIconType: 'exclamation-circle',
        nzTitle: 'Confirmar Actualización',
        nzContent:
          'Estás a punto de guardar los cambios cambiando el tipo de cliente de Persona Moral a Física. Se perderán los datos del representante legal y las sucursales. ¿Deseas continuar?',
        nzOkText: 'Sí, guardar cambios',
        nzOkType: 'primary',
        nzOkDanger: true,
        nzCancelText: 'Cancelar',
        // Si el usuario confirma, se aplica el cambio
        nzOnOk: () => {
          this.procederConGuardado(), this.limpiarDatosMoralAFisica();
        },
      });
    } else {
      this.procederConGuardado();
    }
  }

  private procederConGuardado(): void {
    this.isLoading = true;
    const clienteData = this.prepararClientePrincipal();

    const saveObservable: Observable<Cliente> =
      this.isEditMode && this.clienteId
        ? this.clienteService.updateCliente(this.clienteId, clienteData)
        : this.clienteService.crearCliente(clienteData);

    saveObservable.subscribe({
      next: (response) => {
        // Actualizar clienteExistente si estamos en modo edición
        if (this.isEditMode && !response) {
          this.isLoading = false;
          this.message.success('Cliente actualizado correctamente.');
          this.step1Guardado = true;

          return;
        }

        this.isLoading = false;
        this.message.success('Cliente guardado correctamente.');

        this.clienteId = response!.id;
        this.formularioCliente
          .get('id')
          ?.setValue(response!.id, { emitEvent: false });
        this.isEditMode = true;
        this.clienteExistente = response!;
        this.step1Guardado = true;
        this.cargarSucursalesCliente();
      },
      error: (error) => {
        this.isLoading = false;
        this.message.error(
          error?.message || 'Ocurrió un error al guardar el cliente.'
        );
        console.error('Error al guardar/actualizar cliente:', error);
      },
    });
  }

  guardarContacto(): void {
    // Validaciones y preparación
    if (!this.clienteId) {
      this.message.error('Debes guardar primero la información del cliente');
      return;
    }

    const camposRequeridos = [
      'nombreContacto',
      'apellidosContacto',
      'telefonoContacto',
      'correoContacto',
    ];

    for (const campo of camposRequeridos) {
      const control = this.formularioCliente.get(campo);
      if (control && control.invalid) {
        control.markAllAsTouched();
        this.message.warning(
          'Por favor, completa todos los campos requeridos del contacto.'
        );
        return;
      }
    }
    this.procederConGuardadoContacto();
  }

  private procederConGuardadoContacto(): void {
    this.isLoading = true;
    const contactoData = this.prepararContacto();

    const saveObservable: Observable<any> =
      this.isEditModeContacto && this.clienteId
        ? this.clienteService.updateContacto(this.clienteId, contactoData)
        : this.clienteService.crearContacto(contactoData);

    saveObservable.subscribe({
      next: (response) => {
        this.isLoading = false;
        const message = this.isEditModeContacto
          ? 'Contacto actualizado'
          : 'Contacto guardado';
        this.message.success(`${message} correctamente.`);
        this.isEditModeContacto = true;
        this.contactoExistente = response || contactoData; // Usar la respuesta o los datos enviados
      },
      error: (error) => {
        this.isLoading = false;
        this.message.error(
          error?.message || 'Ocurrió un error al guardar el contacto.'
        );
        console.error('Error al guardar/actualizar contacto:', error);
      },
    });
  }

  guardarDomicilio(): void {
    if (!this.clienteId) {
      this.message.error('Debes guardar primero la información del cliente');
      return;
    }
    const camposRequeridos = [
      'calleNumero',
      'codigoPostal',
      'entidadFederativa',
      'municipio',
    ];
    for (const campo of camposRequeridos) {
      const control = this.formularioCliente.get(campo);
      if (control && control.invalid) {
        control.markAllAsTouched();
        this.message.warning(
          'Por favor, completa todos los campos requeridos del domicilio.'
        );
        return;
      }
    }
    this.procederConGuardadoDomicilio();
  }

  private procederConGuardadoDomicilio(): void {
    this.isLoading = true;
    const domicilioData = this.prepararDomicilio();

    const saveObservable: Observable<any> =
      this.isEditModeDomicilio && this.clienteId
        ? this.clienteService.updateClienteDomicilio(
            this.clienteId,
            domicilioData
          )
        : this.clienteService.crearDomicilio(domicilioData);

    saveObservable.subscribe({
      next: (response) => {
        this.isLoading = false;
        const message = this.isEditModeDomicilio
          ? 'Domicilio actualizado'
          : 'Domicilio guardado';
        this.message.success(`${message} correctamente.`);
        this.isEditModeDomicilio = true;
        this.domicilioExistente = response || domicilioData;
      },
      error: (error) => {
        this.isLoading = false;
        this.message.error(
          error?.message || 'Ocurrió un error al guardar el domicilio.'
        );
        console.error('Error al guardar/actualizar domicilio:', error);
      },
    });
  }

  guardarDomicilioFiscal(): void {
    if (!this.clienteId) {
      this.message.error('Debes guardar primero la información del cliente');
      return;
    }

    const camposRequeridos = [
      'calleNumeroFiscal',
      'codigoPostalFiscal',
      'entidadFederativaFiscal',
      'municipioFiscal',
    ];
    for (const campo of camposRequeridos) {
      const control = this.formularioCliente.get(campo);
      if (control && control.invalid) {
        control.markAllAsTouched();
        this.message.warning(
          'Por favor, completa todos los campos requeridos del domicilio fiscal.'
        );
        return;
      }
    }
    this.procederConGuardadoDomicilioFiscal();
  }

  private procederConGuardadoDomicilioFiscal(): void {
    this.isLoading = true;
    const domicilioFiscalData = this.prepararDomicilioFiscal();

    const saveObservable: Observable<any> =
      this.isEditModeDomicilioFiscal && this.clienteId
        ? this.clienteService.updateClienteDomicilio(
            this.clienteId,
            domicilioFiscalData
          )
        : this.clienteService.crearDomicilio(domicilioFiscalData);

    saveObservable.subscribe({
      next: (response) => {
        this.isLoading = false;
        const message = this.isEditModeDomicilioFiscal
          ? 'Domicilio fiscal actualizado'
          : 'Domicilio fiscal guardado';
        this.message.success(`${message} correctamente.`);
        this.isEditModeDomicilioFiscal = true;
        this.domicilioFiscalExistente = response || domicilioFiscalData;
        if (this.esEmpresa) {
          this.currentStep = 4;
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.message.error(
          error?.message || 'Ocurrió un error al guardar el domicilio fiscal.'
        );
        console.error('Error al guardar/actualizar domicilio fiscal:', error);
      },
    });
  }

  guardarRepresentante(): void {
    if (!this.clienteId) {
      this.message.error('Debes guardar primero la información del cliente');
      return;
    }

    const camposRequeridos = [
      'nombreRepresentante',
      'primerApellidoRepresentante',
      'telefonoMovilRepresentante',
    ];

    for (const campo of camposRequeridos) {
      const control = this.formularioCliente.get(campo);
      if (control && control.invalid) {
        control.markAllAsTouched();
        this.message.warning(
          'Por favor, completa todos los campos requeridos del representante.'
        );
        return;
      }
    }
    this.procederConGuardadoRepresentante();
  }

  private procederConGuardadoRepresentante(): void {
    this.isLoading = true;
    const representanteData = this.prepararRepresentante();

    const saveObservable: Observable<any> =
      this.isEditModeRepresentante && this.clienteId
        ? this.clienteService.updateClienteRepresentante(
            this.clienteId,
            representanteData
          )
        : this.clienteService.crearRepresentanteLegal(representanteData);

    saveObservable.subscribe({
      next: (response) => {
        this.isLoading = false;
        const message = this.isEditModeRepresentante
          ? 'Representante actualizado'
          : 'Representante guardado';
        this.message.success(`${message} correctamente.`);
        this.isEditModeRepresentante = true;
        this.representanteExistente = response || representanteData;
      },
      error: (error) => {
        this.isLoading = false;
        this.message.error(
          error?.message || 'Ocurrió un error al guardar el representante.'
        );
        console.error('Error al guardar/actualizar representante:', error);
      },
    });
  }

  guardarSucursal(): void {
    if (!this.clienteId) {
      this.message.error('Debes guardar primero la información del cliente');
      return;
    }

    const camposRequeridos = [
      'nombreSucursal',
      'calleSucursal',
      'codigoPostalSucursal',
      'entidadFederativaSucursal',
      'municipioSucursal',
      'personaEncargadaSucursal',
      'telefonoSucursal',
    ];

    for (const campo of camposRequeridos) {
      const control = this.formularioCliente.get(campo);
      if (control && control.invalid) {
        control.markAllAsTouched();
        this.message.error(
          'Completa todos los campos requeridos de la sucursal'
        );
        return;
      }
    }

    const sucursalData = this.prepararSucursal();

    if (this.isEditModeSucursal && this.sucursalSeleccionadaId) {
      this.actualizarSucursalExistente(
        this.sucursalSeleccionadaId,
        sucursalData
      );
      return;
    }

    this.isLoading = true;

    this.clienteService.crearSucursal(sucursalData).subscribe({
      next: () => {
        this.isLoading = false;
        this.agregarSucursal = false;
        this.resetearFormularioSucursal();
        this.message.success('Sucursal agregada correctamente');
        this.cargarSucursalesCliente();
      },
      error: (error) => {
        console.error('Error al guardar sucursal:', error);
        this.isLoading = false;
        this.message.error('Error al guardar sucursal: ' + error.message);
      },
    });
  }

  // Método auxiliar para resetear el formulario de sucursal
  private resetearFormularioSucursal(): void {
    this.formularioCliente.patchValue({
      nombreSucursal: '',
      calleSucursal: '',
      coloniaSucursal: '',
      codigoPostalSucursal: '',
      entidadFederativaSucursal: null,
      municipioSucursal: null,
      personaEncargadaSucursal: '',
      telefonoSucursal: '',
    });

    // Resetear estado de validación
    Object.keys(this.formularioCliente.controls).forEach((key) => {
      if (key.includes('Sucursal')) {
        const control = this.formularioCliente.get(key);
        control?.markAsUntouched();
        control?.markAsPristine();
      }
    });
  }

  //=== SUCURSALES ===
  mostrarFormularioSucursal() {
    this.agregarSucursal = true;
    this.isEditModeSucursal = false;

    // Resetear valores y estado de validación
    this.formularioCliente.patchValue({
      nombreSucursal: '',
      calleSucursal: '',
      coloniaSucursal: '',
      codigoPostalSucursal: '',
      entidadFederativaSucursal: null,
      municipioSucursal: null,
      personaEncargadaSucursal: '',
      telefonoSucursal: '',
    });

    // Marcar todos los controles como untouched y pristine
    Object.keys(this.formularioCliente.controls).forEach((key) => {
      if (key.includes('Sucursal')) {
        const control = this.formularioCliente.get(key);
        if (control) {
          control.markAsUntouched();
          control.markAsPristine();
        }
      }
    });
  }

  volverATablaSucursales() {
    this.agregarSucursal = false;
    this.isEditModeSucursal = false;
    this.sucursalSeleccionadaId = null;
  }

  onVer(cliente: Cliente): void {
    this.router.navigate(['/cliente/detalle', cliente.id]);
  }

  onEditar(cliente: any): void {
    this.router.navigate(['/cliente/registrar', cliente.id], {
      queryParams: { modo: 'editar' },
    });
  }

  //=== VALIDACIONES ===

  getValidateStatus(fieldName: string): string {
    const control = this.formularioCliente.get(fieldName);
    if (!control) return '';
    if (
      !control.value ||
      (typeof control.value === 'string' && control.value.trim() === '')
    )
      return '';
    return control.valid ? 'success' : 'error';
  }

  getFieldErrors(fieldName: string): string[] {
    const control = this.formularioCliente.get(fieldName);
    if (control?.errors && (control.touched || control.dirty)) {
      return this.validationMessagesService.getControlErrors(
        fieldName,
        control.errors
      );
    }
    return [];
  }

  //=== MÉTODOS DE CARGA DE DATOS ===

  cargarClienteExistente(id: number): void {
    this.isLoading = true;
    this.clienteService.getClienteById(id).subscribe({
      next: (cliente) => {
        this.clienteExistente = cliente;
        this.cargarDatosClienteEnFormulario(cliente);
        this.step1Guardado = true;
        this.isLoading = false;
        this.cargarContactoExistente(id);
        this.cargarDomicilioExistente(id);
        this.cargarDomicilioFiscalExistente(id);
        if (cliente.tipo === 'M') {
          this.cargarRepresentanteExistente(id);
          this.cargarSucursalesCliente();
        }
      },
      error: (error) => {
        console.error('Error al cargar cliente:', error);
        this.isLoading = false;
        this.message.error('Error al cargar información del cliente');
      },
    });
  }

  cargarContactoExistente(clienteId: number): void {
    this.clienteService.getContactoByCliente(clienteId).subscribe({
      next: (contacto) => {
        if (contacto) {
          this.contactoExistente = contacto;
          this.isEditModeContacto = true;
          this.cargarDatosContactoEnFormulario(contacto);
        }
      },
      error: (error) => {
        console.error('Error al cargar contacto:', error);
      },
    });
  }

  cargarDomicilioExistente(clienteId: number): void {
    this.clienteService.getDomiciliosByCliente(clienteId).subscribe({
      next: (domicilios) => {
        // Filtra el domicilio NO fiscal
        const domicilio = Array.isArray(domicilios)
          ? domicilios.find((d: any) => !d.esFiscal)
          : domicilios;
        if (domicilio) {
          this.domicilioExistente = domicilio;
          this.isEditModeDomicilio = true;
          this.cargarDatosDomicilioEnFormulario(domicilio);
        }
      },
      error: (error) => {
        console.error('Error al cargar domicilio:', error);
      },
    });
  }

  cargarDomicilioFiscalExistente(clienteId: number): void {
    this.clienteService.getDomiciliosByCliente(clienteId).subscribe({
      next: (domicilios) => {
        // Filtra el domicilio fiscal
        const domicilioFiscal = Array.isArray(domicilios)
          ? domicilios.find((d: any) => d.esFiscal)
          : domicilios;
        if (domicilioFiscal) {
          this.domicilioFiscalExistente = domicilioFiscal;
          this.isEditModeDomicilioFiscal = true;
          this.cargarDatosDomicilioFiscalEnFormulario(domicilioFiscal);
        }
      },
      error: (error) => {
        console.error('Error al cargar domicilio fiscal:', error);
      },
    });
  }

  cargarRepresentanteExistente(clienteId: number): void {
    this.clienteService.getRepresentanteByCliente(clienteId).subscribe({
      next: (representante) => {
        if (representante) {
          this.representanteExistente = representante;
          this.isEditModeRepresentante = true;
          this.cargarDatosRepresentanteEnFormulario(representante);
        }
      },
      error: (error) => {
        console.error('Error al cargar representante:', error);
      },
    });
  }

  cargarSucursalesCliente() {
    if (!this.clienteId) return;

    this.isLoading = true;
    this.clienteService.getSucursalesByCliente(this.clienteId).subscribe({
      next: (sucursales) => {
        // Mapear las sucursales y obtener la entidad federativa para cada una
        this.sucursalesCliente = sucursales.map((sucursal: any) => {
          // Obtener la entidad federativa basada en la claveEntidadFederativa
          const claveEntidad = sucursal.municipio?.claveEntidadFederativa;
          const entidad = this.catalogoEntidades.find(
            (e) => e.clave === claveEntidad
          );

          return {
            id: sucursal.id,
            nombreSucursal: sucursal.nombre || '',
            calleSucursal: sucursal.calleNumero || '',
            coloniaSucursal: sucursal.colonia || '',
            codigoPostalSucursal: sucursal.codigoPostal || '',
            entidadFederativaSucursal: entidad?.entidadFederativa || '',
            municipioId: sucursal.municipio?.id,
            municipioSucursal: sucursal.municipio?.municipio || '',
            personaEncargadaSucursal: sucursal.nombrePersonaEncargada || '',
            telefonoSucursal: sucursal.telefono || '',
          };
        });

        // Inicializar los datos mostrados
        this.listOfDisplayDataSucursales = [...this.sucursalesCliente];
        this.totalSucursales = this.listOfDisplayDataSucursales.length;

        // Si estamos en modo edición de sucursal, cargar sus datos ahora
        if (this.isEditModeSucursal && this.sucursalSeleccionadaId) {
          const sucursalAEditar = this.sucursalesCliente.find(
            (s) => s.id === this.sucursalSeleccionadaId
          );
          if (sucursalAEditar) {
            this.cargarDatosSucursalEnFormulario(sucursalAEditar);
          }
        }

        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar sucursales', err);
        this.isLoading = false;
        this.message.error('Error al cargar sucursales del cliente');
      },
    });
  }

  // Carga de Datos
  cargarDatosClienteEnFormulario(cliente: Cliente): void {
    this.formularioCliente.patchValue({
      id: cliente.id,
      tipo: cliente.tipo,
      nombre: cliente.nombre || '',
      primerApellido: cliente.primerApellido || '',
      segundoApellido: cliente.segundoApellido || '',
      nombreComercial: cliente.nombreComercial || '',
      razonSocial: cliente.razonSocial || '',
      rfc: cliente.rfc,
      idGiro: cliente.idGiro,
    });

    // Actualizar estado de esEmpresa
    this.esEmpresa = cliente.tipo === 'M';
  }

  cargarDatosContactoEnFormulario(contacto: any): void {
    this.formularioCliente.patchValue({
      nombreContacto: contacto.nombre || '',
      apellidosContacto: contacto.apellidos || '',
      telefonoContacto: contacto.telefono || '',
      telefonoAdicionalContacto: contacto.telefonoAdicional || '',
      correoContacto: contacto.correoElectronico || '',
    });
  }

  cargarDatosDomicilioEnFormulario(domicilio: any): void {
    const claveEntidad = domicilio.municipio?.claveEntidadFederativa;

    // Primero carga la entidad federativa
    this.formularioCliente.patchValue({
      calleNumero: domicilio.calleNumero || '',
      colonia: domicilio.colonia || '',
      entidadFederativa: claveEntidad || null,
      codigoPostal: domicilio.codigoPostal || '',
    });

    // Cargar los municipios para la entidad
    if (claveEntidad) {
      this.catalogosService.getMunicipiosPorEntidad(claveEntidad).subscribe({
        next: (data) => {
          this.municipiosFiltrados = data;
          const municipioControl = this.formularioCliente.get('municipio');
          if (municipioControl) {
            municipioControl.enable();
            // Establecer el municipio solo si existe y no es nulo
            const municipioId =
              domicilio && domicilio.municipio ? domicilio.municipio.id : null;
            municipioControl.setValue(municipioId);
          }
        },
        error: () => this.message.error('Error al cargar municipios'),
      });
    }
  }

  cargarDatosDomicilioFiscalEnFormulario(domicilio: any): void {
    const claveEntidad = domicilio.municipio?.claveEntidadFederativa;

    // Primero carga la entidad federativa
    this.formularioCliente.patchValue({
      calleNumeroFiscal: domicilio.calleNumero || '',
      coloniaFiscal: domicilio.colonia || '',
      entidadFederativaFiscal: claveEntidad || null,
      codigoPostalFiscal: domicilio.codigoPostal || '',
    });

    // Carga los municipios para la entidad
    if (claveEntidad) {
      this.catalogosService.getMunicipiosPorEntidad(claveEntidad).subscribe({
        next: (data) => {
          this.municipiosFiltradosFiscal = data;
          const municipioFiscalControl =
            this.formularioCliente.get('municipioFiscal');
          if (municipioFiscalControl) {
            municipioFiscalControl.enable();

            // Establece el municipio de forma segura
            const municipioId =
              domicilio && domicilio.municipio ? domicilio.municipio.id : null;
            municipioFiscalControl.setValue(municipioId);
          }
        },
        error: () => this.message.error('Error al cargar municipios fiscales'),
      });
    }
  }

  cargarDatosRepresentanteEnFormulario(representante: any): void {
    this.formularioCliente.patchValue({
      nombreRepresentante: representante.nombre || '',
      primerApellidoRepresentante: representante.primerApellido || '',
      segundoApellidoRepresentante: representante.segundoApellido || '',
      telefonoMovilRepresentante: representante.telefonoMovil || '',
      telefonoOficinaRepresentante: representante.telefonoAdicional || '',
      extensionOficinaRepresentante: representante.extensionOficina || '',
      correoRepresentante: representante.correoElectronico || '',
    });
  }

  cargarDatosSucursalEnFormulario(sucursal: any): void {
    const claveEntidad = this.catalogoEntidades.find(
      (e) => e.entidadFederativa === sucursal.entidadFederativaSucursal
    )?.clave;

    this.formularioCliente.patchValue({
      nombreSucursal: sucursal.nombreSucursal,
      calleSucursal: sucursal.calleSucursal,
      coloniaSucursal: sucursal.coloniaSucursal,
      codigoPostalSucursal: sucursal.codigoPostalSucursal,
      entidadFederativaSucursal: claveEntidad || null,
      personaEncargadaSucursal: sucursal.personaEncargadaSucursal,
      telefonoSucursal: sucursal.telefonoSucursal,
    });

    if (claveEntidad) {
      this.catalogosService.getMunicipiosPorEntidad(claveEntidad).subscribe({
        next: (data) => {
          this.municipiosFiltradosSucursal = data;
          // Usar el ID del municipio directamente
          this.formularioCliente.patchValue({
            municipioSucursal: sucursal.municipioId || null,
          });
          this.formularioCliente.get('municipioSucursal')?.enable();
        },
        error: () =>
          this.message.error('Error al cargar municipios de sucursal'),
      });
    }
  }

  private getFullSucursalById(id: number): any {
    // Este método busca la sucursal completa en la lista que ya cargamos,
    return this.sucursalesCliente.find((s) => s.id === id);
  }

  // Carga inicial de catálogos
  cargarCatalogos() {
    this.catalogosService
      .getGiros()
      .subscribe({ next: (data) => (this.catalogoGiros = data) });
    this.catalogosService.getEntidades().subscribe({
      next: (data) => (this.entidadesFiltradas = this.catalogoEntidades = data),
    });
    this.catalogosService
      .getMunicipios()
      .subscribe({ next: (data) => (this.catalogoMunicipios = data) });
  }

  private setupFormListeners(): void {
    // Listener para cambios de tipo
    const tipoControl = this.formularioCliente.get('tipo');
    if (tipoControl) {
      tipoControl.valueChanges.subscribe(
        this.onTipoChangeWithConfirmation.bind(this)
      );
    }

    // Listener para cambios de entidad federativa
    const entidadControl = this.formularioCliente.get('entidadFederativa');
    if (entidadControl) {
      entidadControl.valueChanges.subscribe((clave: string) => {
        this.onEstadoChange(clave);
      });
    }

    // Listener para cambios de entidad federativa fiscal
    const entidadFiscalControl = this.formularioCliente.get(
      'entidadFederativaFiscal'
    );
    if (entidadFiscalControl) {
      entidadFiscalControl.valueChanges.subscribe((clave: string) => {
        this.onEstadoFiscalChange(clave);
      });
    }

    // Listener para cambios de entidad federativa sucursal
    const entidadSucursalControl = this.formularioCliente.get(
      'entidadFederativaSucursal'
    );
    if (entidadSucursalControl) {
      entidadSucursalControl.valueChanges.subscribe((clave: string) => {
        this.onEstadoSucursalChange(clave);
      });
    }
  }

  // Configuración de búsqueda
  configurarBusquedas() {
    this.entidadSearchChange$
      .pipe(
        debounceTime(300),
        switchMap((term) => {
          this.loadingEntidades = true;
          return this.filtrarEntidades(term);
        })
      )
      .subscribe((entidades) => {
        this.entidadesFiltradas = entidades;
        this.loadingEntidades = false;
      });

    this.municipioSearchChange$
      .pipe(
        debounceTime(300),
        switchMap((term) => {
          this.loadingMunicipios = true;
          return this.filtrarMunicipios(term, this.catalogoMunicipios);
        })
      )
      .subscribe((municipios) => {
        this.municipiosFiltrados = municipios;
        this.loadingMunicipios = false;
      });

    this.municipioFiscalSearchChange$
      .pipe(
        debounceTime(300),
        switchMap((term) => {
          this.loadingMunicipios = true;
          return this.filtrarMunicipios(term, this.catalogoMunicipiosFiscal);
        })
      )
      .subscribe((municipios) => {
        this.municipiosFiltradosFiscal = municipios;
        this.loadingMunicipios = false;
      });

    this.entidadSucursalSearchChange$
      .pipe(
        debounceTime(300),
        switchMap((term) => {
          this.loadingEntidadesSucursal = true;
          return this.filtrarEntidades(term);
        })
      )
      .subscribe((entidades) => {
        this.entidadesFiltradas = entidades;
        this.loadingEntidadesSucursal = false;
      });

    this.municipioSucursalSearchChange$
      .pipe(
        debounceTime(300),
        switchMap((term) => {
          this.loadingMunicipiosSucursal = true;
          return this.filtrarMunicipios(term, this.municipiosFiltradosSucursal);
        })
      )
      .subscribe((municipios) => {
        this.municipiosFiltradosSucursal = municipios;
        this.loadingMunicipiosSucursal = false;
      });
  }

  //=== MÉTODOS PRIVADOS DE PREPARACIÓN DE DATOS ===

  // Preparar datos para envío Cliente
  private prepararClientePrincipal(): Cliente {
    const formValues = this.formularioCliente.value;
    const esEmpresa = this.esEmpresa;

    const cliente: Cliente = {
      id: this.clienteId, // Se envía para actualizar
      tipo: formValues.tipo,

      // Campos condicionales
      nombre: esEmpresa ? undefined : formValues.nombre || '',
      primerApellido: esEmpresa ? undefined : formValues.primerApellido || '',
      segundoApellido: esEmpresa ? '' : formValues.segundoApellido || '',
      nombreComercial: esEmpresa ? formValues.nombreComercial || '' : '',
      razonSocial: esEmpresa ? formValues.razonSocial || '' : '',

      // Campos comunes
      rfc: formValues.rfc,
      idGiro: formValues.idGiro,
      activo: this.clienteExistente?.activo ?? true,
    };

    // Campos de auditoría
    if (this.isEditMode) {
      cliente.fechaActualizacion = new Date().toISOString();
      cliente.usuarioActualizacion = 'usuario_actual'; // Reemplazar con el usuario real
      cliente.fechaRegistro = this.clienteExistente?.fechaRegistro;
      cliente.usuarioRegistro = this.clienteExistente?.usuarioRegistro;
    } else {
      cliente.fechaRegistro = new Date().toISOString();
      cliente.usuarioRegistro = 'usuario_actual'; // Reemplazar con el usuario real
    }

    return cliente;
  }

  // Preparar datos para envío Contacto
  private prepararContacto(): any {
    const v = this.formularioCliente.value;

    // Validar que tenemos el clienteId
    if (!this.clienteId) {
      throw new Error('No se encontró el ID del cliente');
    }

    const contacto = {
      idCliente: this.clienteId,
      nombre: v.nombreContacto,
      apellidos: v.apellidosContacto,
      telefono: v.telefonoContacto,
      telefonoAdicional:
        v.telefonoAdicionalContacto && v.telefonoAdicionalContacto.length === 10
          ? v.telefonoAdicionalContacto
          : null, // Enviar null en lugar de string vacío
      correoElectronico: v.correoContacto,
    };

    return contacto;
  }

  // Preparar datos para envío Domicilio
  private prepararDomicilio(): any {
    const v = this.formularioCliente.value;

    // Validar que tenemos el clienteId
    if (!this.clienteId) {
      throw new Error('No se encontró el ID del cliente');
    }

    const domicilio = {
      idCliente: this.clienteId,
      calleNumero: v.calleNumero,
      colonia: v.colonia,
      codigoPostal: v.codigoPostal,
      entidadFederativa: { id: v.entidadFederativa },
      municipio: { id: v.municipio },
      esFiscal: v.esFiscal || false,
    };

    return domicilio;
  }

  // Preparar datos para envío Domicilio fiscal
  private prepararDomicilioFiscal(): any {
    const v = this.formularioCliente.value;

    // Validar que tenemos el clienteId
    if (!this.clienteId) {
      throw new Error('No se encontró el ID del cliente');
    }

    const domicilio = {
      idCliente: this.clienteId,
      calleNumero: v.calleNumeroFiscal,
      colonia: v.coloniaFiscal,
      codigoPostal: v.codigoPostalFiscal,
      entidadFederativa: { id: v.entidadFederativaFiscal },
      municipio: { id: v.municipioFiscal },
      esFiscal: v.esDomFiscal,
    };

    return domicilio;
  }

  // Preparar datos para envío Representante legal
  private prepararRepresentante(): any {
    const v = this.formularioCliente.value;

    // Validar que tenemos el clienteId
    if (!this.clienteId) {
      throw new Error('No se encontró el ID del cliente');
    }

    const representante = {
      idCliente: this.clienteId,
      nombre: v.nombreRepresentante,
      primerApellido: v.primerApellidoRepresentante,
      segundoApellido: v.segundoApellidoRepresentante || null,
      telefonoMovil: v.telefonoMovilRepresentante,
      telefonoOficina: v.telefonoOficinaRepresentante || null,
      extensionOficina: v.extensionOficinaRepresentante || null,
      correoElectronico: v.correoRepresentante || null,
    };
    return representante;
  }

  // Preparar datos para envío Sucursal
  private prepararSucursal(): any {
    const v = this.formularioCliente.value;

    if (!this.clienteId) {
      throw new Error('No se encontró el ID del cliente');
    }

    const sucursal: any = {
      nombre: v.nombreSucursal,
      calleNumero: v.calleSucursal,
      colonia: v.coloniaSucursal || null,
      codigoPostal: v.codigoPostalSucursal,
      municipio: { id: v.municipioSucursal },
      nombrePersonaEncargada: v.personaEncargadaSucursal,
      telefono: v.telefonoSucursal,
      idCliente: this.clienteId,
    };

    // Solo agregar el ID si estamos en modo edición
    if (this.isEditModeSucursal && this.sucursalSeleccionadaId) {
      sucursal.id = this.sucursalSeleccionadaId;
    }

    return sucursal;
  }

  //=== MÉTODOS PRIVADOS DE FILTRADO ===

  // Filtrado de catálogos Entidades
  private filtrarEntidades(searchTerm: string): Promise<any[]> {
    return Promise.resolve(
      searchTerm
        ? this.catalogoEntidades.filter((e) =>
            e.entidadFederativa.toLowerCase().includes(searchTerm.toLowerCase())
          )
        : this.catalogoEntidades
    );
  }

  // Filtrado de catálogos Municipios
  private filtrarMunicipios(searchTerm: string, lista: any[]): Promise<any[]> {
    return Promise.resolve(
      searchTerm
        ? lista.filter((m) =>
            m.municipio.toLowerCase().includes(searchTerm.toLowerCase())
          )
        : lista
    );
  }

  //=== MÉTODOS DE ACTUALIZACIÓN ===

  actualizarSucursalExistente(idSucursal: number, sucursal: any): void {
    this.isLoading = true;

    // Severifica que se tiene el clienteId
    if (!this.clienteId) {
      this.message.error('No se encontró el ID del cliente');
      this.isLoading = false;
      return;
    }

    this.clienteService
      .updateClienteSucursal(this.clienteId, sucursal)
      .subscribe({
        next: () => {
          this.isLoading = false;
          this.message.success('Sucursal actualizada correctamente');
          this.agregarSucursal = false;
          this.isEditModeSucursal = false;
          this.sucursalSeleccionadaId = null;
          this.cargarSucursalesCliente();
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Error completo al actualizar sucursal:', error);
          this.message.error(
            'Error al actualizar la sucursal: ' + error.message
          );
        },
      });
  }

  searchSucursales(): void {
    const valueNombre = (this._searchValueSucursal ?? '').trim().toLowerCase();
    const valueCalle = (this._searchValueSucursalCalle ?? '')
      .trim()
      .toLowerCase();
    const valueEncargado = (this._searchValueSucursalEncargado ?? '')
      .trim()
      .toLowerCase();
    const valueTelefono = (this._searchValueSucursalTelefono ?? '')
      .trim()
      .toLowerCase();

    if (!valueNombre && !valueCalle && !valueEncargado && !valueTelefono) {
      this.listOfDisplayDataSucursales = [...this.sucursalesCliente];
    } else {
      this.listOfDisplayDataSucursales = this.sucursalesCliente.filter(
        (sucursal) => {
          const nombre = (sucursal.nombreSucursal || '').toLowerCase();
          const calle = (sucursal.calleSucursal || '').toLowerCase();
          const encargado = (
            sucursal.personaEncargadaSucursal || ''
          ).toLowerCase();
          const telefono = (sucursal.telefonoSucursal || '').toLowerCase();

          return (
            (valueNombre ? nombre.includes(valueNombre) : true) &&
            (valueCalle ? calle.includes(valueCalle) : true) &&
            (valueEncargado ? encargado.includes(valueEncargado) : true) &&
            (valueTelefono ? telefono.includes(valueTelefono) : true)
          );
        }
      );
    }
    this.totalSucursales = this.listOfDisplayDataSucursales.length;
    this.pageIndexSucursal = 1;
  }

  // Método para comparar nombres de sucursales (para ordenamiento)
  compareSucursalNombre = (a: any, b: any) =>
    (a.nombreSucursal || '').localeCompare(b.nombreSucursal || '');

  // Métodos para manejar cambios de paginación
  onPageSizeChangeSucursal(size: number): void {
    this.pageSizeSucursal = size;
    this.pageIndexSucursal = 1;
  }

  onPageIndexChangeSucursal(index: number): void {
    this.pageIndexSucursal = index;
  }

  // Manejo input búsqueda para sucursales
  onSearchInputSucursal(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchValueSucursal = target.value;
  }

  onSearchInputSucursalCalle(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchValueSucursalCalle = target.value;
  }

  onSearchInputSucursalEncargado(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchValueSucursalEncargado = target.value;
  }

  onSearchInputSucursalTelefono(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchValueSucursalTelefono = target.value;
  }

  onEditarSucursal(sucursal: any): void {
    this.agregarSucursal = true;
    this.isEditModeSucursal = true;
    this.sucursalSeleccionadaId = sucursal.id;
    const sucursalCompleta = this.getFullSucursalById(sucursal.id);
    this.cargarDatosSucursalEnFormulario(sucursalCompleta);
  }

  //=== PROPIEDADES GETTERS ===

  // Steps habilitados según tipo de cliente
  get stepsHabilitados() {
    return this.esEmpresa ? this.steps : this.steps.slice(0, 4);
  }

  // Getters y setters para los valores de búsqueda
  get searchValueSucursal(): string {
    return this._searchValueSucursal;
  }

  set searchValueSucursal(value: string) {
    this._searchValueSucursal = value;
    this.searchSucursales();
  }

  get searchValueSucursalCalle(): string {
    return this._searchValueSucursalCalle;
  }

  set searchValueSucursalCalle(value: string) {
    this._searchValueSucursalCalle = value;
    this.searchSucursales();
  }

  get searchValueSucursalEncargado(): string {
    return this._searchValueSucursalEncargado;
  }

  set searchValueSucursalEncargado(value: string) {
    this._searchValueSucursalEncargado = value;
    this.searchSucursales();
  }

  get searchValueSucursalTelefono(): string {
    return this._searchValueSucursalTelefono;
  }

  set searchValueSucursalTelefono(value: string) {
    this._searchValueSucursalTelefono = value;
    this.searchSucursales();
  }

  cancelar(): void {
    this.router.navigate(['/cliente/consultar']);
  }
}
