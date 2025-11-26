export const ROLES = {
  // Roles del sistema
  SISTEMAS: 'sistemas',
  ADMINISTRADOR: 'administrador',

  // Roles de departamentos
  RECURSOS_HUMANOS: 'recursos_humanos',
  RECURSOS_MATERIALES: 'recursos_materiales',
  VENTAS: 'ventas',
  CALL_CENTER: 'call_center',
  TECNICOS_SERVICIOS: 'tecnicos_servicios',
  ALMACEN: 'almacen',
  FACTURACION: 'facturacion',
} as const;

export const ROLE_GROUPS = {
  // Acceso completo a todo el sistema
  ADMIN: [ROLES.SISTEMAS, ROLES.ADMINISTRADOR],

  // Acceso a módulo de inventario
  INVENTARIO: [ROLES.RECURSOS_MATERIALES, ROLES.SISTEMAS, ROLES.ADMINISTRADOR],
  INVENTARIO_READ: [ROLES.ALMACEN, ROLES.RECURSOS_HUMANOS],

  // Acceso a módulo de empleados
  EMPLEADOS: [ROLES.RECURSOS_HUMANOS, ROLES.SISTEMAS, ROLES.ADMINISTRADOR],

  // Acceso a módulo de clientes
  CLIENTES: [
    ROLES.VENTAS,
    ROLES.SISTEMAS,
    ROLES.ADMINISTRADOR,
    ROLES.FACTURACION,
  ],

  CLIENTES_READ: [ROLES.TECNICOS_SERVICIOS],
  CLIENTES_READ_UPDATE: [ROLES.CALL_CENTER],
} as const;

// Función helper para verificar si tiene al menos un rol del grupo
export const hasAnyRole = (
  keycloakService: any,
  roles: readonly string[]
): boolean => {
  return roles.some((role) => keycloakService.hasRole(role));
};
