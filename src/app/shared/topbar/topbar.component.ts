import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { Menu, MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { Auth, user, signOut, User } from '@angular/fire/auth'; // <-- Import User type
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { LoginComponent } from '../../auth/login/login.component';
import { SignupComponent } from '../../auth/signup/signup.component';
import { SettingsComponent } from '../../settings/settings.component';
import { UserProfileComponent } from '../../user-profile/user-profile.component';
import {
  SaveConflictDialogComponent,
  SaveChoice,
} from '../save-conflict-dialog/save-conflict-dialog.component';
import {
  PlayerProgressService,
  SaveConflict,
} from '../../services/player-progress.service';

@Component({
  selector: 'app-top-bar',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    AvatarModule,
    LoginComponent,
    SignupComponent,
    SettingsComponent,
    UserProfileComponent,
    SaveConflictDialogComponent,
    DialogModule,
    MenuModule,
  ],
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.css',
})
export class TopbarComponent implements OnInit {
  private auth: Auth = inject(Auth);
  private playerProgressService = inject(PlayerProgressService);
  public saveConflictState: SaveConflict | null = null;
  isUserProfileVisible = false;
  isSettingsVisible = false;
  isAuthDialogVisible = false;
  authDialogMode: 'login' | 'signup' = 'login';
  @ViewChild('userMenu') userMenu!: Menu;
  readonly user$ = user(this.auth);
  userMenuItems: MenuItem[] = [];
  guestMenuItems: MenuItem[] = [];
  ngOnInit() {
    this.setupMenuItems();
    this.playerProgressService.saveConflict.subscribe(conflict => {
      this.saveConflictState = conflict;
    });
  }
  onConflictResolve(choice: SaveChoice): void {
    this.saveConflictState?.resolve(choice);
  }

  setupMenuItems() {
    this.userMenuItems = [
      {
        label: 'Profile',
        icon: 'pi pi-fw pi-user',
        command: () => (this.isUserProfileVisible = true),
      },
      {
        label: 'Logout',
        icon: 'pi pi-fw pi-sign-out',
        command: () => this.logout(),
      },
    ];

    this.guestMenuItems = [
      {
        label: 'Login',
        icon: 'pi pi-fw pi-sign-in',
        command: () => this.showAuthDialog('login'),
      },
      {
        label: 'Sign Up',
        icon: 'pi pi-fw pi-user-plus',
        command: () => this.showAuthDialog('signup'),
      },
    ];
  }

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
