export interface Empleado {
  id: number;
  usuario?: string | null;
  nombre: string;
  primerApellido?: string;
  segundoApellido?: string;
  cargo?: string;
  telefonoPersonal?: string;
  telefonoOficina?: string;
  correoElectronico?: string;
  fechaInicio?: string;
  fechaTermino?: string | null;
  fechaRegistro?: string;
  usuarioRegistro?: string;
  fechaActualizacion?: string | null;
  usuarioActualizacion?: string | null;
}
