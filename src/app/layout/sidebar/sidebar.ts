import { Component, Input } from '@angular/core';

import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { RouterModule } from '@angular/router';
import { KeycloakService } from '../../keycloak/keycloak-service';
import { hasAnyRole, ROLE_GROUPS, ROLES } from '../../constants/roles.constants';


@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    NzLayoutModule,
    NzMenuModule,
    NzIconModule,
    RouterModule,
],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.css'],
})
export class SidebarComponent {
  @Input() isCollapsed: boolean = false;

  ROLES = ROLES;
  ROLE_GROUPS = ROLE_GROUPS;
  hasAnyRole = hasAnyRole; 

  constructor(public keycloakService: KeycloakService) {}
}
