export interface User {
  username: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  segundoApellido?: string;
  password?: string | null;
  realmRoles?: string[];
  clientRoles?: string[];
  estatus?: boolean;
}