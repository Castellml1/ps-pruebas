import { Component, OnInit } from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ActivatedRoute, Router } from '@angular/router';
import { Rol } from '../../../models/roles';
import { RolService } from '../../../services/rol-service';

@Component({
  selector: 'app-rol-list',
  imports: [
    NzTableModule,
    NzButtonModule,
    NzIconModule,
    NzEmptyModule,
    NzSpinModule,
    NzAlertModule,
  ],
  templateUrl: './rol-list.html',
  styleUrl: './rol-list.css',
})
export class RolListComponente implements OnInit {
  listOfRoles: Rol[] = [];
  showSuccessAlert = false;
  isLoading = true;

  // Paginación
  pageSize = 10;
  pageIndex = 1;
  total = 0;

  constructor(
    private roleService: RolService,
    private message: NzMessageService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      if (params['creado'] === 'true') {
        this.showSuccessAlert = true;
        setTimeout(() => {
          this.showSuccessAlert = false;
        }, 3000);

        // Limpiar el parámetro de la URL
        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: {},
          replaceUrl: true,
        });
      }
    });

    this.loadRoles();
  }

  loadRoles(): void {
    this.isLoading = true;
    this.roleService.getRoles().subscribe({
      next: (roles) => {
        this.listOfRoles = roles;
        this.total = this.listOfRoles.length;
        this.isLoading = false;
      },
      error: (error) => {
        this.message.error(error.message);
        this.isLoading = false;
      },
    });
  }

  onAgregarRol(): void {
    this.router.navigate(['/rol/registrar']);
  }
}
