import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameBlocklyComponent } from './game-blockly.component';

describe('GameBlocklyComponent', () => {
  let component: GameBlocklyComponent;
  let fixture: ComponentFixture<GameBlocklyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameBlocklyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GameBlocklyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
