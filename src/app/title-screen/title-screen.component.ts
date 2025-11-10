import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

// --- PrimeNG Modules ---
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { AvatarModule } from 'primeng/avatar';
import { MenuModule } from 'primeng/menu';

// --- Firebase ---
import { Auth, user } from '@angular/fire/auth'; // <-- Import User type

import { environment } from '../../environments/environment';
import { TopbarComponent } from '../shared/topbar/topbar.component';

@Component({
  selector: 'app-title-screen',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    DialogModule,
    AvatarModule,
    MenuModule,
    TopbarComponent
],
  templateUrl: './title-screen.component.html',
  styleUrls: ['./title-screen.component.css'],
})
export class TitleScreenComponent {
  private auth: Auth = inject(Auth);
  private router: Router = inject(Router);
  isProduction = environment.production;
  // Firebase user observable
  readonly user$ = user(this.auth);



  // Dialog visibility state
  isUserProfileVisible = false;
  isSettingsVisible = false;

  goToLevelSelect() {
    this.router.navigate(['/levels']);
  }

  goToDevUploader() {
    if (!this.isProduction) {
      this.router.navigate(['/dev-uploader']);
      return;
    }else{
      //this.router.navigate(['/level-maker']);
      return;
    }
  }




}
