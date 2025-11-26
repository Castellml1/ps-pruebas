import { ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
  importProvidersFrom,
  provideAppInitializer,
  inject } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { es_ES, provideNzI18n } from 'ng-zorro-antd/i18n';
import { registerLocaleData } from '@angular/common';
import es from '@angular/common/locales/es';
import { FormsModule } from '@angular/forms';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { httpErrorInterceptor } from './interceptors/http-error.interceptor';
import { authInterceptor } from './interceptors/auth-interceptor';
import { KeycloakService } from './keycloak/keycloak-service';
import { provideNgIdle } from '@ng-idle/core';
import { provideNgIdleKeepalive } from '@ng-idle/keepalive';
import { NzModalModule } from 'ng-zorro-antd/modal';

registerLocaleData(es);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAppInitializer(() => inject(KeycloakService).init()),
    provideNzI18n(es_ES),
    importProvidersFrom(FormsModule),
    provideAnimationsAsync(),
    provideHttpClient(
      withInterceptors([authInterceptor, httpErrorInterceptor])
    ),
    provideNgIdle(),
    provideNgIdleKeepalive(),
    importProvidersFrom(NzModalModule)
  ]
};
