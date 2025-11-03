import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameExplainComponent } from './game-explain.component';

describe('GameExplainComponent', () => {
  let component: GameExplainComponent;
  let fixture: ComponentFixture<GameExplainComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameExplainComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GameExplainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
