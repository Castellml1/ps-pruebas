import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { KeycloakService } from './keycloak-service';

@Injectable({
  providedIn: 'root',
})
export class KeycloakGuard implements CanActivate {
  constructor(
    private keycloakService: KeycloakService,
    private router: Router
  ) {}

  // Método para verificar si el usuario puede acceder a una ruta
  async canActivate(route: ActivatedRouteSnapshot): Promise<boolean> {
    const isAuthenticated = this.keycloakService.isAuthenticated();

    // Si no está autenticado lo redirigir al login
    if (!isAuthenticated) {
      this.router.navigate(['/login']);
      return false;
    }

    // Verificar lo roles requeridos para la ruta
    const requiredRoles = route.data['roles'] as string[];

    // Obtener los roles del usuario
    const userRoles = this.keycloakService.getClientRoles();
    // Verifica si el usuario tiene al menos uno de los roles requeridos
    const hasRequiredRole = requiredRoles.some((role) =>
      userRoles.includes(role)
    );

    // Si tiene el rol requerido, permitir el acceso
    if (hasRequiredRole) {
      return true;
    }

    // Si no tiene el rol, mostrar mensaje y denegar acceso
    alert('No tienes permiso para acceder a esta página.');
    this.router.navigate(['/inicio']);
    return false;
  }
}
