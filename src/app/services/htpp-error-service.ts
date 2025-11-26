import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';
import { KeycloakService } from '../keycloak/keycloak-service';

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {

  constructor(private keycloakService: KeycloakService) {}
  
  handleError(error: HttpErrorResponse) {
    let msg = 'Ocurrió un error inesperado. Intenta más tarde.';

    if (error.status === 0) {
      console.error('Error de red o conexión:', error.error);
      msg = 'Error de red o conexión. Verifica tu Internet.';
    } else if (error.status === 400) {
      console.error('Error 400: Solicitud incorrecta', error.error);
      msg = error.error?.mensaje || 'Petición incorrecta.';
    } else if (error.status === 401) {
      console.error('Error 401: Sesión expirada', error.error);
      msg = 'No autorizado. Por favor, inicia sesión.';
      this.keycloakService.logout(); // Forzar cierre de sesión
    }
    else if (error.status === 403) {
      console.error('Error 403: No tienes permisos para acceder a este recurso', error.error);
      msg = 'No tienes permisos para acceder a este recurso.';
    }
     else if (error.status === 409) {
      console.error('Error 409: Conflicto', error.error);
      msg = error.error?.mensaje || 'Conflicto.';
    } else if (error.status === 500) {
      console.error('Error 500: Ocurrió un error en el servidor', error.error);
      msg = 'Problema interno del servidor.';
    } else {
      console.error(`Error ${error.status}:`, error.error);
      msg = "Ocurrió un error.";
    }

    return throwError(() => new Error(msg));
  }
}