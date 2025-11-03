import { TestBed } from '@angular/core/testing';

import { PlayerProgressService } from './player-progress.service';

describe('PlayerProgressService', () => {
  let service: PlayerProgressService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PlayerProgressService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
