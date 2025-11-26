import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { FormsModule } from '@angular/forms';

import { User } from '../../../models/users';
import { UsersService } from '../../../services/user-service';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzAlertComponent } from 'ng-zorro-antd/alert';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    FormsModule,
    NzTableModule,
    NzButtonModule,
    NzIconModule,
    NzDropDownModule,
    NzInputModule,
    NzTagModule,
    NzSwitchModule,
    NzEmptyModule,
    NzSpinModule,
    NzAlertComponent,
  ],
  templateUrl: './user-list.html',
  styleUrls: ['./user-list.css'],
})
export class UserListComponent implements OnInit {
  listOfUsers: User[] = [];
  listOfDisplayUsers: User[] = [];
  isLoading = true;
  showSuccessAlert = false;

  // Paginación
  pageSize = 10;
  pageIndex = 1;
  total = 0;

  // Búsqueda
  searchValue = '';
  visible = false;

  constructor(
    private userService: UsersService,
    private message: NzMessageService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadUsers();

    this.route.queryParams.subscribe((params) => {
      if (params['actualizado'] === 'true') {
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
  }

  loadUsers(): void {
    this.isLoading = true;
    this.userService.getUsuarios().subscribe({
      next: (users) => {
        this.listOfUsers = users.map((user) => ({
          ...user,
        }));
        this.listOfDisplayUsers = [...this.listOfUsers];
        this.total = this.listOfUsers.length;
        this.isLoading = false;
      },
      error: (error) => {
        this.message.error(error.message);
        this.isLoading = false;
      },
    });
  }

  getRoles(user: User): string {
    const roles: string[] = [];

    // Roles de cliente
    if (user.clientRoles && user.clientRoles.length > 0) {
      roles.push(...user.clientRoles);
    }

    // Para roles de realm tomar desde el segundo para no mostrar el que te asigna por default
    if (user.realmRoles && user.realmRoles.length > 0) {
      if (user.realmRoles.length > 1) {
        roles.push(...user.realmRoles.slice(1));
      }
    }

    return roles.length > 0 ? roles.join(', ') : '';
  }

  search(): void {
    const filterValue = this.searchValue.toLowerCase();
    this.listOfDisplayUsers = this.listOfUsers.filter((item: User) =>
      item.username.toLowerCase().includes(filterValue)
    );
  }

  reset(): void {
    this.searchValue = '';
    this.search();
  }
  onAgregarUsuario(): void {
    this.router.navigate(['/usuario/registrar']);
  }

  editRoles(user: User): void {
    this.router.navigate(['usuario/roles', user.username]);
  }

  editProfile(user: User): void {
    this.router.navigate(['/usuario/registrar', user.username]);
  }
}
