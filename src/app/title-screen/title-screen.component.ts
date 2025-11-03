import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

// --- PrimeNG Modules ---
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { AvatarModule } from 'primeng/avatar';
import { MenuModule } from 'primeng/menu';
import { Menu } from 'primeng/menu';
import { MenuItem } from 'primeng/api';

// --- Firebase ---
import { Auth, user, signOut, User } from '@angular/fire/auth'; // <-- Import User type

// --- Our Custom Components ---
import { LoginComponent } from '../auth/login/login.component';
import { SignupComponent } from '../auth/signup/signup.component';
import { SettingsComponent } from '../settings/settings.component';
import { UserProfileComponent } from '../user-profile/user-profile.component';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-title-screen',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    DialogModule,
    AvatarModule,
    MenuModule,
    LoginComponent,
    SignupComponent,
    SettingsComponent,
    UserProfileComponent,
  ],
  templateUrl: './title-screen.component.html',
  styleUrls: ['./title-screen.component.css'],
})
export class TitleScreenComponent implements OnInit {
  private auth: Auth = inject(Auth);
  private router: Router = inject(Router);
  isProduction = environment.production;
  // Firebase user observable
  readonly user$ = user(this.auth);

  @ViewChild('userMenu') userMenu!: Menu;
  userMenuItems: MenuItem[] = [];
  guestMenuItems: MenuItem[] = [];

  // Dialog visibility state
  isUserProfileVisible = false;
  isSettingsVisible = false;
  isAuthDialogVisible = false;
  authDialogMode: 'login' | 'signup' = 'login';
 ngOnInit() {
    this.setupMenuItems();
  }

  setupMenuItems() {
    this.userMenuItems = [
      { label: 'Profile', icon: 'pi pi-fw pi-user', command: () => this.isUserProfileVisible = true },
      { label: 'Logout', icon: 'pi pi-fw pi-sign-out', command: () => this.logout() }
    ];

    this.guestMenuItems = [
      { label: 'Login', icon: 'pi pi-fw pi-sign-in', command: () => this.showAuthDialog('login') },
      { label: 'Sign Up', icon: 'pi pi-fw pi-user-plus', command: () => this.showAuthDialog('signup') }
    ];
  }

  goToLevelSelect() {
    this.router.navigate(['/levels']);
  }

  goToDevUploader() {
    this.router.navigate(['/dev-uploader']);
  }

  // --- Auth Dialog Logic ---
  showAuthDialog(mode: 'login' | 'signup') {
    this.authDialogMode = mode;
    this.isAuthDialogVisible = true;
  }

  onAuthSuccess() {
    this.isAuthDialogVisible = false;
  }

  async logout() {
    await signOut(this.auth);
  }

  isUserAvatar(user: User | null): boolean {
    return user?.photoURL ? true : false;
  }

  getUserName(user: User | null): string {
    return user?.displayName || user?.email || 'Guest';
  }

  getUserInitial(user: User | null): string {
    return user?.email ? user.email[0].toUpperCase() : 'G';
  }
}
