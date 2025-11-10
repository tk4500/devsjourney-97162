import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LevelCompleteModalComponent } from './level-complete-modal.component';

describe('LevelCompleteModalComponent', () => {
  let component: LevelCompleteModalComponent;
  let fixture: ComponentFixture<LevelCompleteModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LevelCompleteModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LevelCompleteModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
