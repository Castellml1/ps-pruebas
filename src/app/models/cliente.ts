import { CatEntidadFederativa, CatMunicipio } from "./catalogos";

export interface Cliente {
  id?: number;
  tipo?: string;
  nombre?: string;
  primerApellido?: string;
  segundoApellido?: string;
  nombreComercial?: string;
  razonSocial?: string;
  rfc?: string;
  idGiro?: number;         
  activo?: boolean;
  fechaRegistro?: string;
  fechaActualizacion?: string;
  usuarioRegistro?: string;
  usuarioActualizacion?: string;
}
export interface ClienteContacto {
  id?: number;
  idCliente?: number;
  nombre?: string;
  apellidos?: string;
  telefono?: string;
  telefonoAdicional?: string;
  correoElectronico?: string;
}

export interface ClienteDomicilio {
  id?: number;
  idCliente?: number;
  calleNumero?: string;
  colonia?: string;
  entidadFederativa?: string;
  municipio?: string;
  codigoPostal?: string;
  esFiscal?: boolean;
}

export interface ClienteRepresentanteLegal {
  id?: number;
  idCliente?: number;
  nombre?: string;
  primerApellido?: string;
  segundoApellido?: string;
  telefonoMovil?: string;
  telefonoOficina?: string;
  extensionOficina?: string;
  correoElectronico?: string;
}

export interface ClienteSucursal {
  id?: number;
  idCliente?: number;
  nombre?: string;
  calleNumero?: string;
  colonia?: string;
  entidadFederativa?: CatEntidadFederativa;
  municipio?: CatMunicipio;
  codigoPostal?: string;
  nombrePersonaEncargada?: string;
  telefono?: string;
}

export interface ClienteConInfo extends Cliente {
  contacto?: ClienteContacto | null;
  domicilio?: ClienteDomicilio | null;
  domicilios?: ClienteDomicilio[];
}

export interface ClienteListado {
  id: number;
  tipo: string;
  nombre?: string;
  primerApellido?: string;
  segundoApellido?: string;
  nombreComercial?: string;
  razonSocial?: string;
  rfc: string;
  idGiro: number;
  telefono?: string;
  calleNumero?: string;
  colonia?: string;
  municipio?: string;
  entidadFederativa?: string;
  codigoPostal?: string;
}
