import { Component, OnInit } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { RolService } from '../../../services/rol-service';
import { UsersService } from '../../../services/user-service';
import { ActivatedRoute, Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Rol } from '../../../models/roles';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-user-rol',
  imports: [FormsModule, NzSwitchModule, NzButtonModule, NzSpinModule],
  templateUrl: './user-rol.html',
  styleUrl: './user-rol.css',
})
export class UserRolComponente implements OnInit {
  roles: Rol[] = [];
  roleStates: { [key: string]: boolean } = {};
  isLoading = false;
  username?: string;

  constructor(
    private rolService: RolService,
    private usersService: UsersService,
    private route: ActivatedRoute,
    private router: Router,
    private message: NzMessageService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const username = params.get('username');
      this.username = username || undefined;

      if (this.username) {
        this.loadData(this.username);
      } else {
        this.loadRoles();
      }
    });
  }

  private loadData(username: string): void {
    this.isLoading = true;

    // Usuario con los roles
    forkJoin({
      roles: this.rolService.getRoles(),
      userData: this.usersService.getUsuariosPorUsername(username),
    }).subscribe({
      next: ({ roles, userData }) => {
        this.roles = roles || [];

        // Obtener roles del usuario
        const user = Array.isArray(userData) ? userData[0] : userData;
        const clientRoles: string[] = user?.clientRoles || [];

        this.roles.forEach((r) => {
          this.roleStates[r.name] = clientRoles.includes(r.name);
        });

        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error cargando datos', err);
        this.message.error('Error al cargar los datos');
        this.isLoading = false;
      },
    });
  }

  private loadRoles(): void {
    this.isLoading = true;
    this.rolService.getRoles().subscribe({
      next: (roles) => {
        this.roles = roles || [];
        this.roles.forEach((r) => {
          this.roleStates[r.name] = false;
        });
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error cargando roles', err);
        this.message.error('Error al cargar los roles');
        this.isLoading = false;
      },
    });
  }

  guardarRoles(): void {
    if (!this.username) {
      this.message.warning('Usuario no seleccionado');
      return;
    }

    // Obtener solo los roles que están activados
    const rolesActivos = Object.keys(this.roleStates).filter(
      (k) => this.roleStates[k]
    );

    this.isLoading = true;
    // Asignar roles al usuario
    this.usersService.asignarRoles(this.username, rolesActivos).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/usuario/consultar'], {
          queryParams: { actualizado: 'true' },
        });
      },
      error: (err) => {
        console.error('Error asignando roles', err);
        this.message.error('Error al asignar roles');
        this.isLoading = false;
      },
    });
  }

  cancelar(): void {
    this.router.navigate(['/usuario/consultar']);
  }
}
