export interface Giro {
  id: number;
  giro: string;
}

export interface CatMunicipio {
  id?: number;
  municipio?: string;
  idEstado?: number;
  entidadFederativa?: CatEntidadFederativa;
}

export interface CatEntidadFederativa {
  id?: number;
  entidadFederativa?: string;
  clave?: string;
}
