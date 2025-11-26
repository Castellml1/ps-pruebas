import { HttpHandlerFn, HttpRequest } from "@angular/common/http";
import { KeycloakService } from "../keycloak/keycloak-service";
import { inject } from "@angular/core";

export function authInterceptor(req: HttpRequest<any>, next: HttpHandlerFn) {
  // Inject the current `KeycloakService` and use it to get an authentication token:
  const token = inject(KeycloakService).getToken();

  // Clone the request to add the authentication header.
  const newReq = req.clone({
    headers: req.headers.append('Authorization', `Bearer ${token}`),
  });

  return next(newReq);
}

