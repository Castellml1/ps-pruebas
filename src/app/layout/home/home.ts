import { Component, OnInit } from '@angular/core';
import { KeycloakProfile } from 'keycloak-js';
import { KeycloakService } from '../../keycloak/keycloak-service';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';

@Component({
  selector: 'app-home',
  imports: [    
    NzButtonModule,
    NzCardModule,
    NzGridModule,
    NzIconModule
  ],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit{
    userProfile: KeycloakProfile | undefined;

    constructor(private keycloakService: KeycloakService) {}

    ngOnInit(): void {
        this.userProfile = this.keycloakService.getProfile();

    }

}
