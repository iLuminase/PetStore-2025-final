import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from '../service/auth.service';
import { FooterComponent } from './footer/footer.component';
import { HeaderComponent } from './header/header.component';

@Component({
  selector: 'app-shell-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'shell';

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    // Initialize auth service after Keycloak is ready
    console.log('AppComponent: Initializing auth service...');
    this.authService.initialize().then(() => {
      console.log('AppComponent: Auth service initialized');
      this.authService.updateLoginStatus();
    });
  }
}
