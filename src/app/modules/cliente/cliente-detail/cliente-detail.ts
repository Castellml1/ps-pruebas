import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ClienteService } from '../../../services/cliente-service';
import { CatalogosService } from '../../../services/catalogos-service';
import { Cliente } from '../../../models/cliente';

// Módulos de NG-ZORRO
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzTableModule } from 'ng-zorro-antd/table';
import { PhonePipe } from '../../../utils/phone.pipe';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { catchError, forkJoin, of, switchMap } from 'rxjs';

@Component({
  selector: 'app-cliente-detail',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzSelectModule,
    NzButtonModule,
    NzSpinModule,
    NzTableModule,
    PhonePipe,
    NzIconModule,
    NzDropDownModule,
    NzEmptyModule,
  ],
  templateUrl: './cliente-detail.html',
  styleUrl: './cliente-detail.css',
})
export class ClienteDetailComponente implements OnInit {
  formularioCliente!: FormGroup;
  formularioSucursal!: FormGroup;
  isLoading = true;
  esEmpresa = false;
  clienteId!: number;

  currentStep = 0;
  steps = [
    'Información Personal',
    'Contacto',
    'Domicilio',
    'Domicilio fiscal',
    'Representante legal',
    'Sucursales',
  ];

  // Catálogos
  catalogoGiros: any[] = [];
  catalogoEntidades: any[] = [];
  tipoCliente = [
    { id: 'F', tipo_cliente: 'Persona Física' },
    { id: 'M', tipo_cliente: 'Persona Moral' },
  ];

  // Sucursales
  sucursalesCliente: any[] = [];
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
  mostrarFormularioSucursal = false;
  sucursalSeleccionada: any = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private clienteService: ClienteService,
    private catalogosService: CatalogosService,
    private message: NzMessageService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.cargarCatalogos();

    // Obtener ID desde la URL
    this.route.paramMap.subscribe((params) => {
      const idParam = params.get('id');
      if (idParam) {
        this.clienteId = +idParam;
        this.cargarCliente(this.clienteId);
      }
    });
  }

  initForm(): void {
    this.formularioCliente = this.fb.group({
      // Cliente principal
      id: [{ value: '', disabled: true }],
      tipo: [{ value: 'F', disabled: true }],
      nombre: [{ value: '', disabled: true }],
      primerApellido: [{ value: '', disabled: true }],
      segundoApellido: [{ value: '', disabled: true }],
      nombreComercial: [{ value: '', disabled: true }],
      razonSocial: [{ value: '', disabled: true }],
      rfc: [{ value: '', disabled: true }],
      idGiro: [{ value: null, disabled: true }],

      // Contacto
      nombreContacto: [{ value: '', disabled: true }],
      apellidosContacto: [{ value: '', disabled: true }],
      telefonoContacto: [{ value: '', disabled: true }],
      telefonoAdicionalContacto: [{ value: '', disabled: true }],
      correoContacto: [{ value: '', disabled: true }],

      // Domicilio
      calleNumero: [{ value: '', disabled: true }],
      colonia: [{ value: '', disabled: true }],
      codigoPostal: [{ value: '', disabled: true }],
      entidadFederativa: [{ value: null, disabled: true }],
      municipio: [{ value: null, disabled: true }],
      esFiscal: [{ value: false, disabled: true }],

      // Domicilio fiscal
      calleNumeroFiscal: [{ value: '', disabled: true }],
      coloniaFiscal: [{ value: '', disabled: true }],
      codigoPostalFiscal: [{ value: '', disabled: true }],
      entidadFederativaFiscal: [{ value: null, disabled: true }],
      municipioFiscal: [{ value: null, disabled: true }],
      esDomFiscal: [{ value: true, disabled: true }],

      // Representante legal
      nombreRepresentante: [{ value: '', disabled: true }],
      primerApellidoRepresentante: [{ value: '', disabled: true }],
      segundoApellidoRepresentante: [{ value: '', disabled: true }],
      telefonoMovilRepresentante: [{ value: '', disabled: true }],
      telefonoOficinaRepresentante: [{ value: '', disabled: true }],
      extensionOficinaRepresentante: [{ value: '', disabled: true }],
      correoRepresentante: [{ value: '', disabled: true }],
    });

    this.formularioSucursal = this.fb.group({
      nombreSucursal: [{ value: '', disabled: true }],
      calleSucursal: [{ value: '', disabled: true }],
      coloniaSucursal: [{ value: '', disabled: true }],
      codigoPostalSucursal: [{ value: '', disabled: true }],
      entidadFederativaSucursal: [{ value: '', disabled: true }],
      municipioSucursal: [{ value: '', disabled: true }],
      personaEncargadaSucursal: [{ value: '', disabled: true }],
      telefonoSucursal: [{ value: '', disabled: true }],
    });
  }

  cargarCatalogos(): void {
    this.catalogosService
      .getGiros()
      .subscribe({ next: (data) => (this.catalogoGiros = data) });

    this.catalogosService.getEntidades().subscribe({
      next: (data) => (this.catalogoEntidades = data),
    });
  }

  cargarSucursalesCliente(): void {
    if (!this.clienteId) return;

    this.clienteService.getSucursalesByCliente(this.clienteId).subscribe({
      next: (sucursales) => {
        this.sucursalesCliente = sucursales.map((sucursal: any) => {
          const entidadNombre = this.getNombreEntidadSucursal(sucursal);

          return {
            id: sucursal.id,
            nombreSucursal: sucursal.nombre || '',
            calleSucursal: sucursal.calleNumero || '',
            coloniaSucursal: sucursal.colonia || '',
            codigoPostalSucursal: sucursal.codigoPostal || '',
            entidadFederativaSucursal: entidadNombre,
            municipioId: sucursal.municipio?.id,
            municipioSucursal: sucursal.municipio?.municipio || '',
            personaEncargadaSucursal: sucursal.nombrePersonaEncargada || '',
            telefonoSucursal: sucursal.telefono || '',
          };
        });

        this.listOfDisplayDataSucursales = [...this.sucursalesCliente];
        this.totalSucursales = this.sucursalesCliente.length;
      },
      error: (err) => {
        console.error('Error al cargar sucursales', err);
        this.message.error('Error al cargar sucursales del cliente');
      },
    });
  }

  // Método auxiliar para sucursales
  private getNombreEntidadSucursal(sucursal: any): string {
    if (!sucursal?.municipio?.claveEntidadFederativa) return '';

    const claveEntidad = sucursal.municipio.claveEntidadFederativa;

    const entidad = this.catalogoEntidades.find(
      (e) => e.clave === claveEntidad
    );

    return entidad?.entidadFederativa || '';
  }

  get stepsHabilitados() {
    return this.esEmpresa ? this.steps : this.steps.slice(0, 4);
  }

  cargarCliente(id: number): void {
    this.isLoading = true;

    this.clienteService
      .getClienteById(id)
      .pipe(
        switchMap((cliente) => {
          this.esEmpresa = cliente.tipo === 'M';
          this.formularioCliente.get('id')?.setValue(cliente.id);

          const peticiones = {
            cliente: of(cliente),
            contacto: this.clienteService
              .getContactoByCliente(id)
              .pipe(catchError(() => of(null))),
            domicilios: this.clienteService
              .getDomiciliosByCliente(id)
              .pipe(catchError(() => of([]))),
            // Solo pedir representante si es empresa
            representante: this.esEmpresa
              ? this.clienteService
                  .getRepresentanteByCliente(id)
                  .pipe(catchError(() => of(null)))
              : of(null),
          };

          return forkJoin(peticiones);
        })
      )
      .subscribe({
        next: ({ cliente, contacto, domicilios, representante }) => {
          const domicilio = domicilios.find((d) => !d.esFiscal) || null;
          const domicilioFiscal = domicilios.find((d) => d.esFiscal) || null;

          this.patchFormValues(
            cliente,
            contacto,
            domicilio,
            domicilioFiscal,
            representante
          );
          this.cargarSucursalesCliente();
          this.isLoading = false;
        },
        error: (error) => {
          // Manejo centralizado de errores
          this.isLoading = false;
          this.message.error('Error al cargar los datos del cliente.');
          console.error(error);
        },
      });
  }

  patchFormValues(
    cliente: any,
    contacto: any,
    domicilio: any,
    domicilioFiscal: any,
    representante: any
  ): void {
    // Obtener nombres de entidades federativas
    const entidadFederativaNombre = this.getNombreEntidad(domicilio);
    const municipioNombre = domicilio?.municipio?.municipio || '';

    const entidadFiscalNombre = this.getNombreEntidad(domicilioFiscal);
    const municipioFiscalNombre = domicilioFiscal?.municipio?.municipio || '';

    this.formularioCliente.patchValue({
      numeroCliente: cliente.numeroCliente || '',
      tipo: cliente.tipo,
      nombre: cliente.nombre || '',
      primerApellido: cliente.primerApellido || '',
      segundoApellido: cliente.segundoApellido || '',
      nombreComercial: cliente.nombreComercial || '',
      razonSocial: cliente.razonSocial || '',
      rfc: cliente.rfc || '',
      idGiro: cliente.idGiro,

      nombreContacto: contacto?.nombre || '',
      apellidosContacto: contacto?.apellidos || '',
      telefonoContacto: contacto?.telefono || '',
      telefonoAdicionalContacto: contacto?.telefonoAdicional || '',
      correoContacto: contacto?.correoElectronico || '',

      calleNumero: domicilio?.calleNumero || '',
      colonia: domicilio?.colonia || '',
      codigoPostal: domicilio?.codigoPostal || '',
      entidadFederativa: entidadFederativaNombre,
      municipio: municipioNombre,
      esFiscal: domicilio?.esFiscal || false,

      calleNumeroFiscal: domicilioFiscal?.calleNumero || '',
      coloniaFiscal: domicilioFiscal?.colonia || '',
      codigoPostalFiscal: domicilioFiscal?.codigoPostal || '',
      entidadFederativaFiscal: entidadFiscalNombre,
      municipioFiscal: municipioFiscalNombre,
      esDomFiscal: domicilioFiscal?.esFiscal || true,

      nombreRepresentante: representante?.nombre || '',
      primerApellidoRepresentante: representante?.primerApellido || '',
      segundoApellidoRepresentante: representante?.segundoApellido || '',
      telefonoMovilRepresentante: representante?.telefonoMovil || '',
      telefonoOficinaRepresentante: representante?.telefonoOficina || '',
      extensionOficinaRepresentante: representante?.extensionOficina || '',
      correoRepresentante: representante?.correoElectronico || '',
    });
  }

  // Método auxiliar para obtener el nombre de la entidad federativa
  private getNombreEntidad(domicilio: any): string {
    if (!domicilio?.municipio?.claveEntidadFederativa) return '';

    const claveEntidad = domicilio.municipio.claveEntidadFederativa;

    const entidad = this.catalogoEntidades.find(
      (e) => e.clave === claveEntidad
    );

    return entidad?.entidadFederativa || '';
  }

  showStep(index: number) {
    this.currentStep = index;
  }

  regresar(): void {
    this.router.navigate(['/cliente/consultar']);
  }

  getNombreGiro(idGiro: number): string {
    const giro = this.catalogoGiros.find((g) => g.id === idGiro);
    return giro ? giro.giro : '';
  }

  onVer(cliente: Cliente): void {
    this.router.navigate(['/cliente/detalle', cliente.id]);
  }

  onEditar(cliente: any): void {
    this.router.navigate(['/cliente/registrar', cliente.id], {
      queryParams: { modo: 'editar' },
    });
  }

  // Método para buscar en sucursales
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
    this.pageIndexSucursal = 1; // Resetear a la primera página
  }

  // Método para comparar nombres de sucursales
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

  // Métodos para manejar acciones de sucursales
  onVerSucursal(sucursal: any): void {
    this.sucursalSeleccionada = sucursal;
    this.formularioSucursal.patchValue(sucursal);
    this.mostrarFormularioSucursal = true;
  }

  cerrarDetalleSucursal(): void {
    this.mostrarFormularioSucursal = false;
    this.sucursalSeleccionada = null;
    // Opcional: resetear el formulario si lo consideras necesario
    // this.formularioSucursal.reset();
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
}
