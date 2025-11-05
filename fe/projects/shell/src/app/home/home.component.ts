import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { KeycloakService } from 'keycloak-angular';

@Component({
  selector: 'app-shell-home',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  username: string = '';
  isAuthenticated: boolean = false;

  constructor(private keycloak: KeycloakService) { }

  async ngOnInit() {
    this.isAuthenticated = await this.keycloak.isLoggedIn();
    if (this.isAuthenticated) {
      const profile = await this.keycloak.loadUserProfile();
      this.username = profile.username || profile.email || 'User';
    }
  }

  logout() {
    this.keycloak.logout(window.location.origin);
  }
}
