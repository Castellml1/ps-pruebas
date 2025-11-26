import { inject, Injectable } from '@angular/core';
import Keycloak, { KeycloakProfile } from 'keycloak-js';
import { environment } from '../environments';
import { IdleService } from '../services/idle-service';

@Injectable({
  providedIn: 'root',
})
export class KeycloakService {
  private keycloakAuth: any;
  private userName?: KeycloakProfile;

  constructor() {}

  init(): Promise<any> {
    const idleService = inject(IdleService);
    const keycloakConfig = {
      url: environment.keycloak.config.url,
      realm: environment.keycloak.config.realm,
      clientId: environment.keycloak.config.clientId,
    };

    this.keycloakAuth = new Keycloak(keycloakConfig);

    return new Promise((resolve, reject) => {
      this.keycloakAuth.init(environment.keycloak.initOptions).then(
        async (authenticated: boolean) => {
          if (authenticated) {
            this.userName = await this.keycloakAuth.loadUserProfile();
            this.scheduleTokenRefresh();
            idleService.inactivity();
          }
          resolve(authenticated);
        },
        (error: any) => {
          console.error('Keycloak initialization failed', error);
          reject(error);
        }
      );
    });
  }

  login(): void {
    this.keycloakAuth.login();
  }

  logout(): void {
    this.keycloakAuth.logout({ redirectUri: window.location.origin });
  }

  getToken(): string {
    return this.keycloakAuth.token || '';
  }

  isAuthenticated(): boolean {
    return !!this.keycloakAuth.token;
  }

  getProfile(): KeycloakProfile | undefined {
    return this.userName;
  }

  getTokenAttribute(attributeName: string): any {
    return this.keycloakAuth.tokenParsed?.[attributeName];
  }

  getRoles(): string[] {
    return this.keycloakAuth.tokenParsed?.realm_access?.roles || [];
  }

  getClientRoles(): string[] {
    const clientId = environment.keycloak.config.clientId;
    const clientRoles =
      this.keycloakAuth.tokenParsed?.resource_access?.[clientId]?.roles || [];
    const realmRoles = this.keycloakAuth.tokenParsed?.realm_access?.roles || [];
    return [...clientRoles, ...realmRoles];
  }

  hasRole(role: string): boolean {
    return (
      this.getClientRoles().includes(role) || this.getRoles().includes(role)
    );
  }

  private scheduleTokenRefresh(): void {
    setInterval(() => {
      this.keycloakAuth
        .updateToken(60)
        .then((refreshed: boolean) => {
          if (refreshed) {
           // console.log('Token refreshed');
          } else {
           // console.warn('Token not refreshed, still valid');
          }
        })
        .catch((error: any) => {
          console.error('Failed to refresh token', error);
        });
    }, 20000);
  }
}
