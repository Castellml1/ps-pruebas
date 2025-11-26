import { Component } from '@angular/core';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzIconModule } from 'ng-zorro-antd/icon';

@Component({
  selector: 'app-footer',
  imports: [
    NzLayoutModule,
    NzMenuModule,
    NzIconModule
],
  templateUrl: './footer.html',
  styleUrl: './footer.css'
})
export class Footer {
  readonly date = new Date();
}
