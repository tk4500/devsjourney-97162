import {
  Component,
  inject,
  OnInit,
  OnDestroy,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, Subscription, combineLatest, map, startWith, switchMap } from 'rxjs';

import { Level } from '../models/level.model';
import { LevelService } from '../services/level.service';
import { PlayerProgressService } from '../services/player-progress.service';
import { LevelProgress, PlayerProgress } from '../models/player-progress.model';
import { TooltipModule } from 'primeng/tooltip';

import { ButtonModule } from 'primeng/button';
interface DisplayLevel extends Level {
  isUnlocked: boolean;
  progress?: LevelProgress;
}

@Component({
  selector: 'app-level-select',
  imports: [CommonModule, ButtonModule, TooltipModule],
  templateUrl: './level-select.component.html',
  styleUrl: './level-select.component.css',
})
export class LevelSelectComponent implements OnInit {
  private levelService: LevelService = inject(LevelService);
  private playerProgressService: PlayerProgressService = inject(
    PlayerProgressService
  );
  private router: Router = inject(Router);
  pageSize = 12;
  protected pageValueSubject = new BehaviorSubject<number>(4);
  pageValue$ = this.pageValueSubject.asObservable();
  displayLevels$!: Observable<(DisplayLevel | undefined)[]>;
  private pageStartHistory: (number | undefined)[] = [undefined];
  currentPage = 1;
  lastOrderId: number | undefined = undefined;

  hasMoreLevels = true;

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.updatePageSize();
  }
  ngOnInit(): void {
    this.updatePageSize();
  }

  updatePageSize(): void {
    const width = window.innerWidth;
    let newSize = 12; // default
    if (width < 768) {
      newSize = 6; // 2x3 grid
    } else if (width < 1024) {
      newSize = 9; // 3x3 grid
    }
    if (newSize !== this.pageSize) {
      this.currentPage = 1;
      this.lastOrderId = undefined;
      this.pageStartHistory = [undefined];
    }
      this.pageSize = newSize;
      this.pageValueSubject.next(newSize/3);
      this.loadLevels();
  }
  loadLevels(): void {
    const levels$ = this.levelService.getTutorialLevels(this.pageSize + 1, this.lastOrderId); // Fetch one extra to check if there's a next page
    const progress$ = this.playerProgressService.progress$.pipe(startWith(null));

    this.displayLevels$ = combineLatest([levels$, progress$]).pipe(
      map(([levels, progress]) => {
        this.hasMoreLevels = levels.length > this.pageSize;
        const pageLevels = levels.slice(0, this.pageSize);

        if (pageLevels.length > 0) {
          this.lastOrderId = pageLevels[pageLevels.length - 1].orderId;
        }

        const displayLevels: (DisplayLevel | undefined)[] = pageLevels.map(level => ({
          ...level,
          isUnlocked: this.isLevelUnlocked(level, progress),
          progress: progress?.levelData[level.id]
        }));

        // Add dummy placeholders to fill the grid
        while (displayLevels.length < this.pageSize) {
          displayLevels.push(undefined);
        }
        return displayLevels;
      })
    );
  }
  private isLevelUnlocked(
    level: Level,
    progress: PlayerProgress | null
  ): boolean {
    if (level.orderId === 1) return true; // Level 1 is always unlocked
    return progress?.unlockedLevels.includes(level.id) ?? false;
  }
  nextPage(): void {
    if (this.hasMoreLevels) {
      this.pageStartHistory.push(this.lastOrderId);
      this.currentPage++;
      this.loadLevels(); // loadLevels will use the updated this.lastOrderId
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.pageStartHistory.pop();
      this.lastOrderId =
        this.pageStartHistory[this.pageStartHistory.length - 1];
      this.currentPage--;
      this.loadLevels();
    }
  }
  selectLevel(level?: DisplayLevel) {
    if (!level || !level.isUnlocked) return;
    this.levelService.selectLevel(level); // Set the level in the service
    this.router.navigate(['/game']); // Navigate to the generic game route
  }
  backToTitle() {
    this.router.navigate(['/title']);
  }
}
