import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {MatSidenavModule} from '@angular/material/sidenav';
import { SideBarComponent } from "./components/SideBar/side-bar.component";
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MatSidenavModule, SideBarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'mothy-business';
  sidebarOpen = false;
}
