import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LevelMakerComponent } from './level-maker.component';

describe('LevelMakerComponent', () => {
  let component: LevelMakerComponent;
  let fixture: ComponentFixture<LevelMakerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LevelMakerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LevelMakerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
