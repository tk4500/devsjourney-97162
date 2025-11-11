import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, switchMap, tap, map } from 'rxjs';
import { DocumentData } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';

// PrimeNG Modules
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { TableModule } from 'primeng/table'; // We can use PrimeNG's table for a clean layout

// Services and Models
import { PlayerProgressService, LeaderboardSort } from '../services/player-progress.service';
import { PlayerProgress } from '../models/player-progress.model';

@Component({
  selector: 'app-leaderboard',
  standalone: true,
  imports: [CommonModule, ButtonModule, AvatarModule, TableModule],
  templateUrl: './leaderboard.component.html',
  styleUrls: ['./leaderboard.component.css']
})
export class LeaderboardComponent implements OnInit {
  private playerProgressService = inject(PlayerProgressService);
  private router = inject(Router);
  public auth = inject(Auth); // Public to access currentUser in template

  // --- State Management ---
  public leaderboardData$: Observable<PlayerProgress[]>;
  protected pageTrigger = new BehaviorSubject<{ page: number, lastDoc?: DocumentData }>({ page: 1 });

  public currentSort: LeaderboardSort = 'totalScore';
  public readonly PAGE_SIZE = 10;

  public isLoading = false;
  public isLastPage = false;

  // For pagination
  private pageCursors: (DocumentData | undefined)[] = [undefined];

  constructor() {
    this.leaderboardData$ = this.pageTrigger.pipe(
      tap(() => this.isLoading = true),
      switchMap(trigger =>
        this.playerProgressService.getLeaderboard(this.currentSort, this.PAGE_SIZE + 1, trigger.lastDoc)
      ),
      tap(data => {
        this.isLoading = false;
        // Check if we received more data than the page size, which means there's a next page
        this.isLastPage = data.length <= this.PAGE_SIZE;
        // Store the last document of the *actual* page for the next query
        if (!this.isLastPage) {
          this.pageCursors[this.pageTrigger.value.page] = data[data.length - 2];
        }
      }),
      // Return only the items for the current page
      map(data => data.slice(0, this.PAGE_SIZE))
    );
  }

  ngOnInit(): void {
    this.loadData();
    console.log('LeaderboardComponent initialized');
    console.log('Current user:', this.auth.currentUser);
    console.log('Leaderboard data observable set up');
    console.log('Initial page trigger:', this.pageTrigger.value);
    this.leaderboardData$.subscribe(data => {
      console.log('Leaderboard data:', data);
    });
  }

  loadData(): void {
    this.pageTrigger.next({ page: 1 });
  }

  changeSort(sortBy: LeaderboardSort): void {
    if (this.currentSort === sortBy) return;
    this.currentSort = sortBy;
    this.pageCursors = [undefined]; // Reset pagination history
    this.pageTrigger.next({ page: 1, lastDoc: undefined });
  }

  nextPage(): void {
    if (this.isLastPage) return;
    const currentPage = this.pageTrigger.value.page;
    const lastDocForNextPage = this.pageCursors[currentPage];
    this.pageTrigger.next({ page: currentPage + 1, lastDoc: lastDocForNextPage });
  }

  previousPage(): void {
    const currentPage = this.pageTrigger.value.page;
    if (currentPage <= 1) return;
    const lastDocForPrevPage = this.pageCursors[currentPage - 2];
    this.pageTrigger.next({ page: currentPage - 1, lastDoc: lastDocForPrevPage });
  }

  backToTitle(): void {
    this.router.navigate(['/title']);
  }
}
