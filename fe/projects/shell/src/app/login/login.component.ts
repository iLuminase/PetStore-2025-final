import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
    selector: 'app-login',
    standalone: true,
    template: `
    <div class="login-container">
      <h2>Login</h2>
      <p>Please log in to access the application.</p>
      <button (click)="login()" class="login-button">Login with Keycloak</button>
    </div>
  `,
    styles: [`
    .login-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      padding: 20px;
    }
    .login-button {
      padding: 12px 24px;
      background-color: #1976d2;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 16px;
    }
    .login-button:hover {
      background-color: #1565c0;
    }
  `]
})
export class LoginComponent {
    constructor(
        private authService: AuthService,
        private router: Router
    ) { }

    login(): void {
        this.authService.login();
    }
}