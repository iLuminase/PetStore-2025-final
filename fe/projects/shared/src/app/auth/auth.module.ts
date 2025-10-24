import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

// Services
import { AuthService } from './services/auth.service';
import { GoogleOAuthService } from './services/google-oauth.service';

// Guards
import { AuthGuard } from './guards/auth.guard';

// Interceptors
import { AuthInterceptor } from './interceptors/auth.interceptor';

@NgModule({
    declarations: [],
    imports: [
        CommonModule,
        HttpClientModule,
        ReactiveFormsModule,
    ],
    providers: [
        AuthService,
        GoogleOAuthService,
        AuthGuard,
        {
            provide: HTTP_INTERCEPTORS,
            useClass: AuthInterceptor,
            multi: true
        }
    ],
    exports: [
        CommonModule,
        HttpClientModule,
        ReactiveFormsModule,
    ],
})
export class AuthModule {
    // Module for shared authentication using Google OAuth
}