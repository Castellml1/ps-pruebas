import { Routes } from '@angular/router';
import { Home } from './layout/home/home';
import { DispositivoFormComponente } from './modules/inventario/dispositivo-form/dispositivo-form';
import { DispositivoListComponente } from './modules/inventario/dispositivo-list/dispositivo-list';
import { EmpleadoFormComponente } from './modules/empleados/empleado-form/empleado-form';
import { EmpleadoListComponente } from './modules/empleados/empleado-list/empleado-list';
import { EmpleadoDetailComponente } from './modules/empleados/empleado-detail/empleado-detail';
import { DispositivoDetailComponente } from './modules/inventario/dispositivo-detail/dispositivo-detail';
import { ClienteFormComponente } from './modules/cliente/cliente-form/cliente-form';
import { ClienteDetailComponente } from './modules/cliente/cliente-detail/cliente-detail';
import { ClienteListComponente } from './modules/cliente/cliente-list/cliente-list';
import { KeycloakGuard } from './keycloak/keycloak.guard';
import { ROLE_GROUPS } from './constants/roles.constants';
import { UserFormComponente } from './modules/users/user-form/user-form';
import { UserRolComponente } from './modules/users/user-rol/user-rol';
import { RolFormComponente } from './modules/roles/rol-form/rol-form';
import { RolListComponente } from './modules/roles/rol-list/rol-list';
import { UserListComponent } from './modules/users/user-list/user-list';

export const routes: Routes = [
  {
    path: '',
    component: Home,
  },
  {
    path: 'inicio',
    component: Home,
  },
  {
    path: 'inventario/agregar-dispositivo',
    component: DispositivoFormComponente,
    canActivate: [KeycloakGuard],
    data: { roles: ROLE_GROUPS.INVENTARIO },
  },
  {
    path: 'inventario/agregar-dispositivo/:id',
    component: DispositivoFormComponente,
    canActivate: [KeycloakGuard],
    data: { roles: ROLE_GROUPS.INVENTARIO },
  },
  {
    path: 'inventario/consultar-dispositivos',
    component: DispositivoListComponente,
    canActivate: [KeycloakGuard],
    data: {
      roles: [...ROLE_GROUPS.INVENTARIO, ...ROLE_GROUPS.INVENTARIO_READ],
    },
  },
  {
    path: 'inventario/detalle-dispositivo/:id',
    component: DispositivoDetailComponente,
    canActivate: [KeycloakGuard],
    data: {
      roles: [...ROLE_GROUPS.INVENTARIO, ...ROLE_GROUPS.INVENTARIO_READ],
    },
  },
  {
    path: 'empleado/registrar',
    component: EmpleadoFormComponente,
    canActivate: [KeycloakGuard],
    data: { roles: ROLE_GROUPS.EMPLEADOS },
  },
  {
    path: 'empleado/registrar/:id',
    component: EmpleadoFormComponente,
    canActivate: [KeycloakGuard],
    data: { roles: ROLE_GROUPS.EMPLEADOS },
  },
  {
    path: 'empleado/consultar',
    component: EmpleadoListComponente,
    canActivate: [KeycloakGuard],
    data: { roles: ROLE_GROUPS.EMPLEADOS },
  },
  {
    path: 'empleado/detalle/:id',
    component: EmpleadoDetailComponente,
    canActivate: [KeycloakGuard],
    data: { roles: ROLE_GROUPS.EMPLEADOS },
  },
  {
    path: 'cliente/registrar',
    component: ClienteFormComponente,
    canActivate: [KeycloakGuard],
    data: { roles: ROLE_GROUPS.CLIENTES },
  },
  // Para actualizar
  {
    path: 'cliente/registrar/:id',
    component: ClienteFormComponente,
    canActivate: [KeycloakGuard],
    data: {
      roles: [...ROLE_GROUPS.CLIENTES, ...ROLE_GROUPS.CLIENTES_READ_UPDATE],
    },
  },
  {
    path: 'cliente/consultar',
    component: ClienteListComponente,
    canActivate: [KeycloakGuard],
    data: {
      roles: [
        ...ROLE_GROUPS.CLIENTES,
        ...ROLE_GROUPS.CLIENTES_READ_UPDATE,
        ...ROLE_GROUPS.CLIENTES_READ,
      ],
    },
  },
  {
    path: 'cliente/detalle/:id',
    component: ClienteDetailComponente,
    canActivate: [KeycloakGuard],
    data: {
      roles: [
        ...ROLE_GROUPS.CLIENTES,
        ...ROLE_GROUPS.CLIENTES_READ_UPDATE,
        ...ROLE_GROUPS.CLIENTES_READ,
      ],
    },
  },
  {
    path: 'usuario/registrar',
    component: UserFormComponente,
    canActivate: [KeycloakGuard],
    data: {
      roles: ROLE_GROUPS.ADMIN,
    },
  },
  {
    path: 'usuario/registrar/:username',
    component: UserFormComponente,
    canActivate: [KeycloakGuard],
    data: {
      roles: ROLE_GROUPS.ADMIN,
    },
  },
  {
    path: 'usuario/consultar',
    component: UserListComponent,
    canActivate: [KeycloakGuard],
    data: {
      roles: ROLE_GROUPS.ADMIN,
    },
  },
  {
    path: 'usuario/roles/:username',
    component: UserRolComponente,
    canActivate: [KeycloakGuard],
    data: {
      roles: ROLE_GROUPS.ADMIN,
    },
  },
  {
    path: 'rol/registrar',
    component: RolFormComponente,
    canActivate: [KeycloakGuard],
    data: {
      roles: ROLE_GROUPS.ADMIN,
    },
  },
  {
    path: 'rol/registrar/:id',
    component: RolFormComponente,
    canActivate: [KeycloakGuard],
    data: {
      roles: ROLE_GROUPS.ADMIN,
    },
  },
  {
    path: 'rol/consultar',
    component: RolListComponente,
    canActivate: [KeycloakGuard],
    data: {
      roles: ROLE_GROUPS.ADMIN,
    },
  },
];
