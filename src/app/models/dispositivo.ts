export interface Dispositivo {
  id?: number;
  tipo: TipoDispositivo;
  marca: string;
  modelo: string;
  numSerie?: string;
  imei?: string;
  comentarios?: string;
  idEmpleado?: number;
  proveedor?: string;
  fechaCompra?: string;
  fechaTerminoGarantia?: string;
  fechaRegistro?: string;
  usuarioRegistro?: string;
  fechaActualizacion?: string | null;
  usuarioActualizacion?: string | null;
}

export interface TipoDispositivo {
  id: number;
  tipo?: string;
}
