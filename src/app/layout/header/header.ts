import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { KeycloakService } from '../../keycloak/keycloak-service';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { KeycloakProfile } from 'keycloak-js';

@Component({
  selector: 'app-header',
  imports: [
    NzLayoutModule,
    NzMenuModule,
    NzIconModule,
    NzDropDownModule
],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header implements OnInit{
  @Input() isCollapsed = false;
  @Output() toggle = new EventEmitter<void>();

  menuVisible = false;
  userProfile: KeycloakProfile | undefined;
  segundoApellido: string | undefined;

  constructor(private keycloakService: KeycloakService) {}

  ngOnInit(): void {
    this.userProfile = this.keycloakService.getProfile();
    this.segundoApellido = this.keycloakService.getTokenAttribute('segundoApellido');
  }

  onToggleSidebar(): void {
    this.toggle.emit();
  }

  logout(): void {
    this.keycloakService.logout();
  }
}
