
import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { Footer } from './layout/footer/footer';
import { Header } from './layout/header/header';
import { SidebarComponent } from './layout/sidebar/sidebar';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    NzLayoutModule,
    NzBreadCrumbModule,
    NzMenuModule,
    NzIconModule,
    Footer,
    Header,
    RouterOutlet,
    SidebarComponent
],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit{
  isCollapsed = false;
  showLayout = false;

  constructor(private router: Router) {}

  ngOnInit() {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        // Ocultar layout en rutas específicas como login
        this.showLayout = !event.url.includes('/login');
      }
    });
  }

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }
}
