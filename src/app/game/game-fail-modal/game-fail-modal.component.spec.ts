import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameFailModalComponent } from './game-fail-modal.component';

describe('GameFailModalComponent', () => {
  let component: GameFailModalComponent;
  let fixture: ComponentFixture<GameFailModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameFailModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GameFailModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
