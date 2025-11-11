import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

// --- PrimeNG Modules ---
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { AvatarModule } from 'primeng/avatar';
import { MenuModule } from 'primeng/menu';

// --- Firebase ---
import { Auth, user } from '@angular/fire/auth'; // <-- Import User type
import { AudioService } from '../services/audio.service';
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
export class TitleScreenComponent implements OnInit{
goToLeaderboard() {
    this.audioService.playSfx('ui_confirm');
    this.router.navigate(['/leaderboard']);
}
  private audioService: AudioService = inject(AudioService);

  private auth: Auth = inject(Auth);
  private router: Router = inject(Router);
  isProduction = environment.production;
  // Firebase user observable
  readonly user$ = user(this.auth);



  // Dialog visibility state
  isUserProfileVisible = false;
  isSettingsVisible = false;
  ngOnInit(): void {
    this.audioService.playMusic('menu');
  }
  goToLevelSelect() {
    this.audioService.playSfx('ui_confirm');
    this.router.navigate(['/levels']);
  }

  goToDevUploader() {
    this.audioService.playSfx('ui_confirm');
    if (!this.isProduction) {
      this.router.navigate(['/dev-uploader']);
      return;
    }else{
      //this.router.navigate(['/level-maker']);
      return;
    }
  }




}
