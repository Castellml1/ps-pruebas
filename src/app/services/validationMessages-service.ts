import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ValidationMessagesService {
  private errorMessages: { [key: string]: { [key: string]: string } } = {
    required: {
      default: 'Este campo es requerido', // Validaciones específicas para dispositivos
      id_tipo: 'Selecciona un Tipo de Dispositivo',
      marca: 'Ingresa la Marca',
      modelo: 'Ingresa el Modelo',
      idEmpleado: 'Debes seleccionar un empleado', // Validaciones específicas para empleados
      nombre: 'Ingresa el Nombre',
      primerApellido: 'Ingresa el Primer Apellido',
      cargo: 'Ingresa el Cargo',
      telefonoPersonal: 'Ingresa el Teléfono Personal',
      fechaInicio: 'Selecciona la Fecha de Inicio', // Validaciones específicas para Clientes (NUEVO)
      tipo: 'Selecciona el Tipo de Cliente',
      rfc: 'Ingresa el RFC',
      idGiro: 'Selecciona el Giro del Cliente',
      nombreComercial: 'Ingresa el Nombre Comercial',
      razonSocial: 'Ingresa la Razón Social',
      nombreContacto: 'Ingresa el Nombre del Contacto',
      apellidosContacto: 'Ingresa los Apellidos del Contacto',
      telefonoContacto: 'Ingresa el Teléfono del Contacto',
      correoContacto: 'Ingresa el Correo Electrónico del Contacto',
      calleNumero: 'Ingresa la Calle y Número',
      colonia: 'Ingresa la Colonia',
      codigoPostal: 'Ingresa el Código Postal',
      entidadFederativa: 'Selecciona la Entidad Federativa',
      municipio: 'Selecciona el Municipio',
      calleNumeroFiscal: 'Ingresa la Calle y Número Fiscal',
      coloniaFiscal: 'Ingresa la Colonia Fiscal',
      codigoPostalFiscal: 'Ingresa el Código Postal Fiscal',
      entidadFederativaFiscal: 'Selecciona la Entidad Federativa Fiscal',
      municipioFiscal: 'Selecciona el Municipio Fiscal',
      nombreRepresentante: 'Ingresa el Nombre del Representante',
      primerApellidoRepresentante:
        'Ingresa el Primer Apellido del Representante',
      telefonoMovilRepresentante: 'Ingresa el Teléfono Móvil del Representante',
      nombreSucursal: 'Ingresa el Nombre de la Sucursal',
      calleSucursal: 'Ingresa la Calle y Número de la Sucursal',
      codigoPostalSucursal: 'Ingresa el Código Postal de la Sucursal',
      entidadFederativaSucursal: 'Selecciona la Entidad de la Sucursal',
      municipioSucursal: 'Selecciona el Municipio de la Sucursal',
      personaEncargadaSucursal: 'Ingresa la Persona Encargada',
      telefonoSucursal: 'Ingresa el Teléfono de la Sucursal',
    },
    pattern: {
      default: 'El formato no es válido', // Validaciones específicas para dispositivos
      numSerie: 'Número de serie: 8-20 caracteres alfanuméricos',
      imei: 'IMEI: exactamente 15 dígitos', // Validaciones específicas para empleados
      telefonoPersonal: 'Teléfono: exactamente 10 dígitos',
      telefonoOficina: 'Teléfono: exactamente 10 dígitos', // Validaciones específicas para Clientes (NUEVO)
      telefonoContacto: 'Teléfono: exactamente 10 dígitos',
      telefonoAdicionalContacto: 'Teléfono: exactamente 10 dígitos',
      codigoPostal: 'Código Postal: exactamente 5 dígitos',
      codigoPostalFiscal: 'Código Postal: exactamente 5 dígitos',
      telefonoMovilRepresentante: 'Teléfono: exactamente 10 dígitos',
      telefonoOficinaRepresentante: 'Teléfono: exactamente 10 dígitos',
      codigoPostalSucursal: 'Código Postal: exactamente 5 dígitos',
      telefonoSucursal: 'Teléfono: exactamente 10 dígitos',
      contraseña:
        'Contraseña: 8-20 caracteres, al menos 1 mayúscula, 1 minúscula y 1 carácter especial (# $ % & @ * / +)',
    },
    email: {
      // Validaciones específicas para empleados
      default: 'Ingresa un correo electrónico válido', // Validaciones específicas para Clientes (NUEVO)
      correoContacto: 'Ingresa un correo electrónico válido',
      correoRepresentante: 'Ingresa un correo electrónico válido',
    },
    maxlength: {
      // Validaciones específicas para dispositivos
      default: 'Has excedido el número máximo de caracteres',
      comentarios: 'Comentario: máximo 500 caracteres', // Validaciones específicas para Clientes (NUEVO)
      nombre: 'El Nombre no debe exceder 50 caracteres',
      primerApellido: 'El Primer Apellido no debe exceder 50 caracteres',
      segundoApellido: 'El Segundo Apellido no debe exceder 50 caracteres',
      nombreComercial: 'El Nombre Comercial no debe exceder 100 caracteres',
      razonSocial: 'La Razón Social no debe exceder 100 caracteres',
      rfc: 'El RFC no debe exceder 13 caracteres',
      nombreContacto: 'El Nombre del Contacto no debe exceder 50 caracteres',
      apellidosContacto:
        'Los Apellidos del Contacto no deben exceder 50 caracteres',
      correoContacto: 'El Correo Electrónico no debe exceder 100 caracteres',
      calleNumero: 'La Calle y Número no debe exceder 100 caracteres',
      calleNumeroFiscal:
        'La Calle y Número Fiscal no debe exceder 100 caracteres',
      nombreRepresentante:
        'El Nombre del Representante no debe exceder 50 caracteres',
      primerApellidoRepresentante:
        'El Primer Apellido no debe exceder 50 caracteres',
      segundoApellidoRepresentante:
        'El Segundo Apellido no debe exceder 50 caracteres',
      extensionOficinaRepresentante:
        'La Extensión no debe exceder 10 caracteres',
      correoRepresentante:
        'El Correo Electrónico no debe exceder 100 caracteres',
      nombreSucursal: 'El Nombre de la Sucursal no debe exceder 100 caracteres',
      calleSucursal: 'La Calle de la Sucursal no debe exceder 100 caracteres',
      coloniaSucursal:
        'La Colonia de la Sucursal no debe exceder 100 caracteres',
      personaEncargadaSucursal:
        'La Persona Encargada no debe exceder 100 caracteres',
    },
    minlength: {
      // Validaciones específicas para dispositivos
      marca: 'La marca debe tener al menos 2 caracteres',
      modelo: 'El modelo debe tener al menos 2 caracteres', // Validaciones específicas para Clientes (NUEVO)
      nombre: 'El Nombre debe tener al menos 2 caracteres',
      primerApellido: 'El Primer Apellido debe tener al menos 2 caracteres',
      segundoApellido: 'El Segundo Apellido debe tener al menos 2 caracteres',
      nombreComercial: 'El Nombre Comercial debe tener al menos 2 caracteres',
      razonSocial: 'La Razón Social debe tener al menos 2 caracteres',
      nombreContacto: 'El Nombre del Contacto debe tener al menos 2 caracteres',
      apellidosContacto:
        'Los Apellidos del Contacto deben tener al menos 2 caracteres',
      nombreRepresentante:
        'El Nombre del Representante debe tener al menos 2 caracteres',
      primerApellidoRepresentante:
        'El Primer Apellido debe tener al menos 2 caracteres',
      segundoApellidoRepresentante:
        'El Segundo Apellido debe tener al menos 2 caracteres',
      nombreSucursal:
        'El Nombre de la Sucursal debe tener al menos 2 caracteres',
      calleSucursal: 'La Calle de la Sucursal debe tener al menos 2 caracteres',
    },
  };

  getErrorMessage(fieldName: string, errorType: string): string {
    if (
      this.errorMessages[errorType] &&
      this.errorMessages[errorType][fieldName]
    ) {
      return this.errorMessages[errorType][fieldName];
    }
    if (
      this.errorMessages[errorType] &&
      this.errorMessages[errorType]['default']
    ) {
      return this.errorMessages[errorType]['default'];
    }
    return `Error de validación en ${fieldName}`;
  }

  getControlErrors(fieldName: string, errors: any): string[] {
    const errorMessages: string[] = [];
    if (errors) {
      Object.keys(errors).forEach((errorType) => {
        errorMessages.push(this.getErrorMessage(fieldName, errorType));
      });
    }
    return errorMessages;
  }
}
