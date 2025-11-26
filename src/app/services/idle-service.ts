import { Injectable } from '@angular/core';
import { Idle, DEFAULT_INTERRUPTSOURCES } from '@ng-idle/core';
import { KeycloakService } from '../keycloak/keycloak-service';
import { NzModalService, NzModalRef } from 'ng-zorro-antd/modal';
import { interval, Subscription } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class IdleService {
  private modalRef?: NzModalRef;
  private countdownSub?: Subscription;

  constructor(
    private idle: Idle,
    private keycloak: KeycloakService,
    private modal: NzModalService
  ) {}

  inactivity(): void {
    this.idle.setIdle(1800); // segundos de inactividad antes de disparar warning
    this.idle.setTimeout(30); // Idle maneja su propio timeout, pero el modal usa su contador aparte
    this.idle.setInterrupts(DEFAULT_INTERRUPTSOURCES);

    this.idle.onTimeoutWarning.subscribe(() => this.inactivityModal()); // mostrar modal de advertencia
    this.idle.watch(); // iniciar seguimiento de inactividad
  }

  private inactivityModal(): void {
    if (this.modalRef) return;

    let countdown = 15;

    this.modalRef = this.modal.confirm({
      nzClassName: 'custom-modal',
      nzClosable: false,
       nzIconType: 'exclamation-circle',
      nzTitle: 'Sesión inactiva',
      nzContent: this.modalMessage(countdown), // mensaje de la función modalMessage
      nzOkText: 'Sí, continuar',
      nzCancelText: 'No, cerrar sesión',
      nzOnOk: () => {
        this.clearCountdown(); // limpiar contador y suscripción
        this.resetInactivity(); // reiniciar el seguimiento de inactividad
      },
      nzOnCancel: () => {
        this.clearCountdown(); // limpiar contador y suscripción
        this.keycloak.logout(); // cerrar sesión
      },
    });

    // iniciar el contador regresivo
    this.countdownSub = interval(1000).subscribe(() => {
      countdown--;
      this.modalRef?.updateConfig({ nzContent: this.modalMessage(countdown) });
      if (countdown <= 0) {
        this.keycloak.logout(); // cerrar sesión
      }
    });
  }

  // mensaje del modal con el contador
  private modalMessage(contador: number): string { 
    return `Se cerrará sesión por inactividad. 
          ¿Requieres más tiempo? 
          (Se cerrará en ${contador} segundos)`;
  }

  // limpiar el contador y la suscripción
  private clearCountdown(): void {
    this.countdownSub?.unsubscribe(); 
    this.countdownSub = undefined;
    this.modalRef = undefined; 
  }

  // reiniciar el seguimiento de inactividad
  resetInactivity(): void {
    this.clearCountdown();
    this.idle.watch(); // reiniciar el seguimiento de inactividad
  }

  // detener el seguimiento de inactividad
  stopInactivity(): void {
    this.clearCountdown();
    this.idle.stop();
  }
}
