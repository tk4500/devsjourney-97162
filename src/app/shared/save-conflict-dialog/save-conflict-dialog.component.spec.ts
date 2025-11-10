import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SaveConflictDialogComponent } from './save-conflict-dialog.component';

describe('SaveConflictDialogComponent', () => {
  let component: SaveConflictDialogComponent;
  let fixture: ComponentFixture<SaveConflictDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SaveConflictDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SaveConflictDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
