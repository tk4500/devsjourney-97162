import { Routes } from '@angular/router';
import { TitleScreenComponent } from './title-screen/title-screen.component';
import { LevelSelectComponent } from './level-select/level-select.component';
import { LeaderboardComponent } from './leaderboard/leaderboard.component'; // WIP
import { LevelMakerComponent } from './level-maker/level-maker.component';   // WIP
import { GameComponent } from './game/game.component';
import { FirestoreUploaderComponent } from './firestore-uploader/firestore-uploader.component';
import { environment } from '../environments/environment'

const isProduction = environment.production;
let preroute = [];
if (isProduction){
  preroute.push({ path: 'level-maker', component: LevelMakerComponent });
}else{
  preroute.push({ path: 'dev-uploader', component: FirestoreUploaderComponent });
}


export const routes: Routes = [
  { path: 'title', component: TitleScreenComponent },
  { path: 'levels', component: LevelSelectComponent },
  { path: 'game', component: GameComponent },
  { path: 'leaderboard', component: LeaderboardComponent },
  ...preroute,
  { path: '', redirectTo: '/title', pathMatch: 'full' },
  { path: '**', redirectTo: '/title' },
];
