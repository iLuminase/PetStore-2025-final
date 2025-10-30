import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';

@Component({
    selector: 'app-profile',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="profile-container">
      <h2>User Profile</h2>
      <div *ngIf="userProfile">
        <p><strong>Username:</strong> {{ userProfile.username }}</p>
        <p><strong>Email:</strong> {{ userProfile.email }}</p>
        <p><strong>First Name:</strong> {{ userProfile.firstName }}</p>
        <p><strong>Last Name:</strong> {{ userProfile.lastName }}</p>
      </div>
      <div *ngIf="!userProfile">
        <p>Loading profile...</p>
      </div>
      <button (click)="logout()" class="logout-button">Logout</button>
    </div>
  `,
    styles: [`
    .profile-container {
      max-width: 600px;
      margin: 20px auto;
      padding: 20px;
      border: 1px solid #ddd;
      border-radius: 8px;
    }
    .logout-button {
      margin-top: 20px;
      padding: 10px 20px;
      background-color: #f44336;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    .logout-button:hover {
      background-color: #d32f2f;
    }
  `]
})
export class ProfileComponent implements OnInit {
    userProfile: any = null;

    constructor(private authService: AuthService) { }

    async ngOnInit(): Promise<void> {
        this.userProfile = await this.authService.getUserProfile();
    }

    logout(): void {
        this.authService.logout();
    }
}